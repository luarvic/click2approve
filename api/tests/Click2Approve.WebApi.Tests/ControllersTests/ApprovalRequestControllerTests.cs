using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Tests.Extensions;
using Click2Approve.WebApi.Tests.Models;

namespace Click2Approve.WebApi.Tests.ControllersTests;

public class ApprovalRequestControllerTests(CustomWebApplicationFactory<Program> applicationFactory) : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly CustomWebApplicationFactory<Program> _applicationFactory = applicationFactory;

    [Theory]
    [InlineData("POST", "api/v1/tenants/00000000-0000-0000-0000-000000000001/requests")]
    [InlineData("GET", "api/v1/tenants/00000000-0000-0000-0000-000000000001/requests")]
    [InlineData("GET", "api/v1/tenants/00000000-0000-0000-0000-000000000001/requests/00000000-0000-0000-0000-000000000002")]
    public async Task Requests_WithoutBearerToken_ShouldReturnUnauthorized(string httpMethod, string url)
    {
        var client = _applicationFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Parse(httpMethod), url);
        var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ResourceEndpoints_WithMissingGlobalIds_ReturnNotFound()
    {
        var credentials = new Credentials { Email = $"missing-request-{Guid.NewGuid()}@example.com", Password = "ZAQ12wsx!" };
        var client = _applicationFactory.CreateClient();
        await client.RegisterAsync(credentials, CancellationToken.None);

        var login = await client.LogInAsync(credentials, CancellationToken.None);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login.AccessToken);
        var tenantGlobalId = await client.GetCurrentTenantIdAsync(login.AccessToken, CancellationToken.None);
        var missingGlobalId = Guid.NewGuid();

        var requestGetResponse = await client.GetAsync($"api/v1/tenants/{tenantGlobalId}/requests/{missingGlobalId}");
        Assert.Equal(HttpStatusCode.NotFound, requestGetResponse.StatusCode);

        var requestCancelResponse = await client.PostAsync($"api/v1/tenants/{tenantGlobalId}/requests/{missingGlobalId}/cancel", null);
        Assert.Equal(HttpStatusCode.NotFound, requestCancelResponse.StatusCode);

        var taskGetResponse = await client.GetAsync($"api/v1/tenants/{tenantGlobalId}/tasks/{missingGlobalId}");
        Assert.Equal(HttpStatusCode.NotFound, taskGetResponse.StatusCode);

        var taskCompleteResponse = await client.PostAsJsonAsync($"api/v1/tenants/{tenantGlobalId}/tasks/complete", new
        {
            GlobalId = missingGlobalId,
            Status = ApprovalRequestTaskStatus.Approved
        });
        Assert.Equal(HttpStatusCode.NotFound, taskCompleteResponse.StatusCode);
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
        var requesterTenantId = await client.GetCurrentTenantIdAsync(requesterLogin.AccessToken, CancellationToken.None);
        var userFiles = await client.UploadTextFilesAsync(requesterLogin.AccessToken,
            new Dictionary<string, string> { { "request.txt", "Approval request test file" } },
            CancellationToken.None);
        var response = await client.PostAsJsonAsync($"api/v1/tenants/{requesterTenantId}/requests", new ApprovalRequestSubmitDto
        {
            Title = "Cycle-safe request",
            RequestFiles = [.. userFiles.Select((file, index) => new ApprovalRequestFileSubmitDto
            {
                UserFileGlobalId = file.GlobalId,
                Sequence = index
            })],
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
                            Email = approver.Email
                        }
                    ]
                },
                new ApprovalRequestStepSubmitDto
                {
                    Sequence = 2,
                    Mode = ApprovalStepMode.All,
                    Approvers =
                    [
                        new ApprovalRequestApproverSubmitDto
                        {
                            Type = ApprovalRecipientType.Email,
                            Email = $"later-{Guid.NewGuid()}@example.com"
                        }
                    ]
                }
            ],
            StepVisibility =
            [
                new ApprovalRequestStepVisibilitySubmitDto
                {
                    StepSequence = 2,
                    ApproverStepSequence = 1,
                    ApproverIndex = 0,
                    IsVisible = false
                }
            ]
        });
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());

        var approvalRequests = await client.ListApprovalRequestsAsync(requesterLogin.AccessToken, CancellationToken.None);

        var approvalRequestSummary = Assert.Single(approvalRequests);
        var approvalRequestResponse = await client.GetAsync($"api/v1/tenants/{requesterTenantId}/requests/{approvalRequestSummary.GlobalId}");
        Assert.True(approvalRequestResponse.IsSuccessStatusCode, await approvalRequestResponse.Content.ReadAsStringAsync());
        var approvalRequestJson = await approvalRequestResponse.Content.ReadAsStringAsync();
        using var approvalRequestDocument = JsonDocument.Parse(approvalRequestJson);
        Assert.False(approvalRequestDocument.RootElement.TryGetProperty("tasks", out _));

        var approvalRequest = await client.GetApprovalRequestAsync(
            requesterLogin.AccessToken,
            approvalRequestSummary.GlobalId,
            CancellationToken.None);
        Assert.Single(approvalRequest.Steps.Single(step => step.Sequence == 2).Visibility);
        var approvalRequestTask = Assert.Single(approvalRequest.Steps.Single(step => step.Sequence == 1).Tasks);

        var approverClient = _applicationFactory.CreateClient();
        var approverLogin = await approverClient.LogInAsync(approver, CancellationToken.None);
        approverClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", approverLogin.AccessToken);
        var approverTenantId = await approverClient.GetCurrentTenantIdAsync(approverLogin.AccessToken, CancellationToken.None);
        var taskResponse = await approverClient.GetAsync($"api/v1/tenants/{approverTenantId}/tasks/{approvalRequestTask.GlobalId}");
        Assert.True(taskResponse.IsSuccessStatusCode, await taskResponse.Content.ReadAsStringAsync());
        var taskJson = await taskResponse.Content.ReadAsStringAsync();
        Assert.Contains("\"approvalRequest\":{", taskJson);
        Assert.Contains("\"steps\"", taskJson);
        Assert.Contains("\"createdByEmail\"", taskJson);
        Assert.Contains("\"taskLogEntries\"", taskJson);

        var task = await taskResponse.Content.ReadFromJsonAsync<ApprovalRequestTaskDetailDto>();
        Assert.NotNull(task);
        Assert.Equal(requester.Email, task.RequestedByDisplayName);
        Assert.Equal(approvalRequest.RevisionNumber, task.RevisionNumber);
        Assert.NotNull(task.ApprovalRequest);
        Assert.Collection(task.ApprovalRequest.Steps.OrderBy(step => step.Sequence),
            step =>
            {
                Assert.Equal(1, step.Sequence);
                Assert.True(step.IsVisible);
                Assert.NotNull(step.Mode);
                Assert.Single(step.Tasks);
                Assert.Single(step.Approvers);
                Assert.Empty(step.Visibility);
            },
            step =>
            {
                Assert.Equal(2, step.Sequence);
                Assert.False(step.IsVisible);
                Assert.Null(step.Mode);
                Assert.Empty(step.Tasks);
                Assert.Empty(step.Approvers);
                Assert.Empty(step.Visibility);
            });
        Assert.All(task.ApprovalRequest.TaskLogEntries, logEntry =>
            Assert.Equal(task.GlobalId, logEntry.ApprovalRequestTaskGlobalId));

        response = await approverClient.PostAsJsonAsync($"api/v1/tenants/{approverTenantId}/tasks/complete", new
        {
            GlobalId = task.GlobalId,
            Status = ApprovalRequestTaskStatus.Approved
        });
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());

        taskResponse = await approverClient.GetAsync($"api/v1/tenants/{approverTenantId}/tasks/{task.GlobalId}");
        Assert.True(taskResponse.IsSuccessStatusCode, await taskResponse.Content.ReadAsStringAsync());
        task = await taskResponse.Content.ReadFromJsonAsync<ApprovalRequestTaskDetailDto>();
        Assert.NotNull(task);
        Assert.NotNull(task.ApprovalRequest);
        Assert.All(task.ApprovalRequest.TaskLogEntries, logEntry =>
            Assert.Equal(task.GlobalId, logEntry.ApprovalRequestTaskGlobalId));
        Assert.Collection(task.RequestFiles,
            file => Assert.Equal("request.txt", file.UserFile.Name));
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
        var requesterTenantId = await requesterClient.GetCurrentTenantIdAsync(requesterLogin.AccessToken, CancellationToken.None);
        var userFiles = await requesterClient.UploadTextFilesAsync(requesterLogin.AccessToken,
            new Dictionary<string, string> { { "request.txt", "Approval request test file" } },
            CancellationToken.None);
        var response = await requesterClient.PostAsJsonAsync($"api/v1/tenants/{requesterTenantId}/requests", new ApprovalRequestSubmitDto
        {
            Title = "Original task title",
            Description = "Original task description",
            RequestFiles = [.. userFiles.Select((file, index) => new ApprovalRequestFileSubmitDto
            {
                UserFileGlobalId = file.GlobalId,
                Sequence = index
            })],
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
                            Email = approver.Email
                        }
                    ]
                }
            ]
        });
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());

        var submittedRequestSummary = Assert.Single(await requesterClient.ListApprovalRequestsAsync(requesterLogin.AccessToken, CancellationToken.None));
        var submittedRequest = await requesterClient.GetApprovalRequestAsync(
            requesterLogin.AccessToken,
            submittedRequestSummary.GlobalId,
            CancellationToken.None);
        var task = Assert.Single(Assert.Single(submittedRequest.Steps).Tasks);

        var approverClient = _applicationFactory.CreateClient();
        var approverLogin = await approverClient.LogInAsync(approver, CancellationToken.None);
        approverClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", approverLogin.AccessToken);
        var approverTenantId = await approverClient.GetCurrentTenantIdAsync(approverLogin.AccessToken, CancellationToken.None);
        var taskResponse = await approverClient.GetAsync($"api/v1/tenants/{approverTenantId}/tasks/{task.GlobalId}");
        Assert.True(taskResponse.IsSuccessStatusCode, await taskResponse.Content.ReadAsStringAsync());
        var taskDetail = await taskResponse.Content.ReadFromJsonAsync<ApprovalRequestTaskDetailDto>();
        Assert.NotNull(taskDetail);
        Assert.Equal(requester.Email, taskDetail.RequestedByDisplayName);
        Assert.NotNull(taskDetail.ApprovalRequest);
        Assert.Single(taskDetail.ApprovalRequest.Steps);
        Assert.Single(Assert.Single(taskDetail.ApprovalRequest.Steps).Tasks);

        response = await approverClient.PostAsJsonAsync($"api/v1/tenants/{approverTenantId}/tasks/complete", new
        {
            GlobalId = task.GlobalId,
            Status = ApprovalRequestTaskStatus.Approved,
            Comment = "Approved",
            Title = "Modified task title",
            Description = "Modified task description"
        });
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());

        var completedRequestSummary = Assert.Single(await requesterClient.ListApprovalRequestsAsync(requesterLogin.AccessToken, CancellationToken.None));
        var completedRequest = await requesterClient.GetApprovalRequestAsync(
            requesterLogin.AccessToken,
            completedRequestSummary.GlobalId,
            CancellationToken.None);
        var completedTask = Assert.Single(Assert.Single(completedRequest.Steps).Tasks);
        Assert.Equal("Original task title", completedTask.Title);
        Assert.Equal("Original task description", completedTask.Description);
    }
}
