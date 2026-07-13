using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Tests.Extensions;
using Click2Approve.WebApi.Tests.Models;

namespace Click2Approve.WebApi.Tests.ControllersTests;

public class ApprovalRequestControllerTests(CustomWebApplicationFactory<Program> applicationFactory) : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly CustomWebApplicationFactory<Program> _applicationFactory = applicationFactory;

    [Theory]
    [InlineData("POST", "api/request")]
    [InlineData("PUT", "api/request/1/steps")]
    [InlineData("DELETE", "api/request")]
    [InlineData("GET", "api/request/list")]
    [InlineData("GET", "api/request/1")]
    public async Task Requests_WithoutBearerToken_ShouldReturnUnauthorized(string httpMethod, string url)
    {
        var client = _applicationFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Parse(httpMethod), url);
        var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    /// <summary>
    /// Ensures submitted requests can be listed without serializing EF navigation cycles.
    /// </summary>
    [Fact]
    public async Task ListAsync_WithApprovalTasks_ReturnsFiniteResponseGraph()
    {
        var requester = new Credentials { Email = $"requester-{Guid.NewGuid()}@example.com", Password = "ZAQ12wsx!" };
        var approver = new Credentials { Email = $"approver-{Guid.NewGuid()}@example.com", Password = "ZAQ12wsx!" };
        await _applicationFactory.CreateClient().RegisterAsync(requester, CancellationToken.None);
        await _applicationFactory.CreateClient().RegisterAsync(approver, CancellationToken.None);

        var client = _applicationFactory.CreateClient();
        var requesterLogin = await client.LogInAsync(requester, CancellationToken.None);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", requesterLogin.AccessToken);
        var userFiles = await client.UploadTextFilesAsync(requesterLogin.AccessToken,
            new Dictionary<string, string> { { "request.txt", "Approval request test file" } },
            CancellationToken.None);
        var response = await client.PostAsJsonAsync("api/request", new ApprovalRequestSubmitDto
        {
            Title = "Cycle-safe request",
            UserFileIds = userFiles.Select(file => file.Id).ToList(),
            Steps =
            [
                new ApprovalRequestStepSubmitDto
                {
                    Sequence = 1,
                    Mode = ApprovalStepMode.Any,
                    Approvers =
                    [
                        new ApprovalRequestApproverSubmitDto
                        {
                            Type = ApprovalRecipientType.Email,
                            Email = approver.Email,
                            CanViewRequest = true
                        }
                    ]
                }
            ]
        });
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());

        var approvalRequests = await client.ListApprovalRequestsAsync(requesterLogin.AccessToken, CancellationToken.None);

        var approvalRequest = await client.GetApprovalRequestAsync(
            requesterLogin.AccessToken,
            Assert.Single(approvalRequests).Id,
            CancellationToken.None);
        Assert.Single(approvalRequest.Tasks);
        Assert.Single(Assert.Single(approvalRequest.Steps).Tasks);
    }

    [Fact]
    public async Task CompleteAsync_WithTaskTitleAndDescription_DoesNotModifyTaskDetails()
    {
        var requester = new Credentials { Email = $"requester-{Guid.NewGuid()}@example.com", Password = "ZAQ12wsx!" };
        var approver = new Credentials { Email = $"approver-{Guid.NewGuid()}@example.com", Password = "ZAQ12wsx!" };
        await _applicationFactory.CreateClient().RegisterAsync(requester, CancellationToken.None);
        await _applicationFactory.CreateClient().RegisterAsync(approver, CancellationToken.None);

        var requesterClient = _applicationFactory.CreateClient();
        var requesterLogin = await requesterClient.LogInAsync(requester, CancellationToken.None);
        requesterClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", requesterLogin.AccessToken);
        var userFiles = await requesterClient.UploadTextFilesAsync(requesterLogin.AccessToken,
            new Dictionary<string, string> { { "request.txt", "Approval request test file" } },
            CancellationToken.None);
        var response = await requesterClient.PostAsJsonAsync("api/request", new ApprovalRequestSubmitDto
        {
            Title = "Original task title",
            Description = "Original task description",
            UserFileIds = userFiles.Select(file => file.Id).ToList(),
            Steps =
            [
                new ApprovalRequestStepSubmitDto
                {
                    Sequence = 1,
                    Mode = ApprovalStepMode.Any,
                    Approvers =
                    [
                        new ApprovalRequestApproverSubmitDto
                        {
                            Type = ApprovalRecipientType.Email,
                            Email = approver.Email,
                            CanViewRequest = true
                        }
                    ]
                }
            ]
        });
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());

        var submittedRequestSummary = Assert.Single(await requesterClient.ListApprovalRequestsAsync(requesterLogin.AccessToken, CancellationToken.None));
        var submittedRequest = await requesterClient.GetApprovalRequestAsync(
            requesterLogin.AccessToken,
            submittedRequestSummary.Id,
            CancellationToken.None);
        var task = Assert.Single(submittedRequest.Tasks);

        var approverClient = _applicationFactory.CreateClient();
        var approverLogin = await approverClient.LogInAsync(approver, CancellationToken.None);
        approverClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", approverLogin.AccessToken);
        response = await approverClient.PostAsJsonAsync("api/task/complete", new
        {
            task.Id,
            Status = ApprovalRequestTaskStatus.Approved,
            Comment = "Approved",
            Title = "Modified task title",
            Description = "Modified task description"
        });
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());

        var completedRequestSummary = Assert.Single(await requesterClient.ListApprovalRequestsAsync(requesterLogin.AccessToken, CancellationToken.None));
        var completedRequest = await requesterClient.GetApprovalRequestAsync(
            requesterLogin.AccessToken,
            completedRequestSummary.Id,
            CancellationToken.None);
        var completedTask = Assert.Single(completedRequest.Tasks);
        Assert.Equal("Original task title", completedTask.Title);
        Assert.Equal("Original task description", completedTask.Description);
    }
}
