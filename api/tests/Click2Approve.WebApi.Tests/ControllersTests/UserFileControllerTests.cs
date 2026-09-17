using System.Net;
using System.Net.Http.Headers;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Tests.Extensions;
using Click2Approve.WebApi.Tests.Helpers;
using Click2Approve.WebApi.Tests.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.WebApi.Tests.ControllersTests;

/// <summary>
/// Tests UserFileController class.
/// </summary>
public class UserFileControllerTests(CustomWebApplicationFactory<Program> applicationFactory) : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client = applicationFactory.CreateClient();
    private readonly ApiDbContext _db = applicationFactory.Services.GetRequiredService<ApiDbContext>();

    /// <summary>
    /// Makes sure an anonymous user cannot access the controller's endpoints.
    /// </summary>
    [Theory]
    [InlineData("POST", "api/v1/tenants/00000000-0000-0000-0000-000000000001/files/upload")]
    [InlineData("GET", "api/v1/tenants/00000000-0000-0000-0000-000000000001/requests/00000000-0000-0000-0000-000000000002/attachments/00000000-0000-0000-0000-000000000003/downloadBase64")]
    [InlineData("GET", "api/v1/tenants/00000000-0000-0000-0000-000000000001/tasks/00000000-0000-0000-0000-000000000003/requestAttachments/00000000-0000-0000-0000-000000000004/downloadBase64")]
    [InlineData("DELETE", "api/v1/tenants/00000000-0000-0000-0000-000000000001/files/00000000-0000-0000-0000-000000000002")]
    public async Task AllEndpoints_WhenRequestedWithoutBearerToken_ShouldReturnUnauthorized(string httpMethod, string url)
    {
        var request = new HttpRequestMessage(HttpMethod.Parse(httpMethod), url);
        var response = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ResourceEndpoints_WithMissingGlobalIds_ReturnNotFound()
    {
        var credentials = new Credentials { Email = $"missing-file-{Guid.NewGuid()}@example.com", Password = "ZAQ12wsx!" };
        await _client.RegisterAsync(credentials, CancellationToken.None);

        var login = await _client.LogInAsync(credentials, CancellationToken.None);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login.AccessToken);
        var tenantGlobalId = await _client.GetCurrentTenantIdAsync(login.AccessToken, CancellationToken.None);
        var missingFileGlobalId = Guid.NewGuid();
        var missingApprovalRequestGlobalId = Guid.NewGuid();
        var missingTaskGlobalId = Guid.NewGuid();

        var deleteResponse = await _client.DeleteAsync($"api/v1/tenants/{tenantGlobalId}/files/{missingFileGlobalId}");
        Assert.Equal(HttpStatusCode.NotFound, deleteResponse.StatusCode);

        var requestFileResponse = await _client.GetAsync($"api/v1/tenants/{tenantGlobalId}/requests/{missingApprovalRequestGlobalId}/attachments/{missingFileGlobalId}/downloadBase64");
        Assert.Equal(HttpStatusCode.NotFound, requestFileResponse.StatusCode);

        var taskFileResponse = await _client.GetAsync($"api/v1/tenants/{tenantGlobalId}/tasks/{missingTaskGlobalId}/requestAttachments/{missingFileGlobalId}/downloadBase64");
        Assert.Equal(HttpStatusCode.NotFound, taskFileResponse.StatusCode);
    }

    /// <summary>
    /// Verifies uploads, resource-authorized downloads, and deletion of unattached uploads.
    /// </summary>
    [Fact]
    public async Task AllEndpoints_WhenRequestedWithBearerToken_ShouldWorkProperly()
    {
        var testData = new List<UserFileControllerTestDataEntry>
        {
            new()
            {
                Credentials = new Credentials { Email = "user1@UserFileControllerTests.com", Password = "ZAQ12wsx!" },
                FilesToUpload = new Dictionary<string, string>
                {
                    { "textFile1.txt", "textFile1 content" },
                    { "textFile2.txt", "textFile2 content" }
                }
            },
            new()
            {
                Credentials = new Credentials { Email = "user2@UserFileControllerTests.com", Password = "ZAQ12wsx!" },
                FilesToUpload = new Dictionary<string, string>
                {
                    { "textFile3.txt", "textFile2 content" }
                }
            },
        };

        foreach (var testDataEntry in testData)
        {
            await _client.RegisterAsync(testDataEntry.Credentials, CancellationToken.None);
        }

        foreach (var testDataEntry in testData)
        {
            var loginData = await _client.LogInAsync(testDataEntry.Credentials, CancellationToken.None);

            var uploadedFiles = await _client.UploadTextFilesAsync(loginData.AccessToken, testDataEntry.FilesToUpload, CancellationToken.None);
            Assert.Equal(testDataEntry.FilesToUpload.Count, uploadedFiles.Count);
        }

        foreach (var testDataEntry in testData)
        {
            var normalizedEmail = testDataEntry.Credentials.Email.ToLowerInvariant();

            var filesOwnedByUser = _db.UserFiles
                .Where(x => x.Owner != null && x.Owner.NormalizedEmail == normalizedEmail)
                .ToList();

            Assert.All(filesOwnedByUser, file =>
            {
                Assert.Equal(UserFileStorageType.Private, file.StorageType);
                Assert.Equal(UserFileStatus.Uploaded, file.Status);
            });
        }

        foreach (var testDataEntry in testData)
        {
            var loginData = await _client.LogInAsync(testDataEntry.Credentials, CancellationToken.None);
            var normalizedEmail = testDataEntry.Credentials.Email.ToLowerInvariant();

            var filesOwnedByOtherUsers = _db.UserFiles
                .Where(x => x.Owner != null && x.Owner.NormalizedEmail != normalizedEmail)
                .ToList();

            foreach (var file in filesOwnedByOtherUsers)
            {
                await Assert.ThrowsAsync<Exception>(async () =>
                    await _client.DeleteFileAsync(loginData.AccessToken, file.GlobalId, CancellationToken.None));
            }
        }

        var requester = testData.First();
        var assignee = testData.First(x => x.Credentials.Email != requester.Credentials.Email);
        var requesterNormalizedEmail = requester.Credentials.Email.ToLowerInvariant();
        var filesOwnedByRequester = _db.UserFiles
            .Where(x => x.Owner != null && x.Owner.NormalizedEmail == requesterNormalizedEmail)
            .ToList();
        var taskFile = filesOwnedByRequester.First();
        var laterRequestFile = filesOwnedByRequester.Single(file => file.Id != taskFile.Id);
        var payload = new SubmitApprovalRequestRequest
        {
            Title = "File access approval",
            RequestFiles =
            [
                new ApprovalRequestFileRequest
                {
                    UserFileGlobalId = taskFile.GlobalId,
                    Sequence = 0
                }
            ],
            Steps =
            [
                new ApprovalRequestStepRequest
                {
                    Sequence = 1,
                    Mode = ApprovalStepMode.Any,
                    Action = ApprovalRequestTaskAction.Approve,
                    Assignees =
                    [
                        new ApprovalRequestAssigneeRequest
                        {
                            Type = AssigneeType.User,
                            Email = assignee.Credentials.Email
                        }
                    ]
                }
            ]
        };

        var requesterLoginData = await _client.LogInAsync(requester.Credentials, CancellationToken.None);
        await _client.SubmitApprovalRequestAsync(requesterLoginData.AccessToken, payload, CancellationToken.None);

        var approvalRequest = _db.ApprovalRequests
            .Include(request => request.RequestFiles)
            .Include(request => request.Steps)
                .ThenInclude(step => step.Tasks)
            .Single(request => request.RequestFiles.Any(file => file.UserFileId == taskFile.Id));
        await _db.Entry(taskFile).ReloadAsync();
        Assert.Equal(UserFileStatus.Attached, taskFile.Status);
        var approvalRequestTask = Assert.Single(Assert.Single(approvalRequest.Steps).Tasks);
        approvalRequest.RequestFiles.Add(new ApprovalRequestFile
        {
            ApprovalRequest = approvalRequest,
            UserFile = laterRequestFile,
            UserFileId = laterRequestFile.Id,
            Sequence = 2,
            RevisionAction = ApprovalRequestFileRevisionAction.Unchanged
        });
        await _db.SaveChangesAsync();

        var requesterDownload = await _client.DownloadApprovalRequestBase64Async(
            requesterLoginData.AccessToken,
            taskFile.GlobalId,
            approvalRequest.GlobalId,
            CancellationToken.None);

        var expectedContent = $"data:{MimeTypes.GetMimeType(taskFile.Name)};base64,{Converters.GetBase64FromString(requester.FilesToUpload[taskFile.Name])}";
        Assert.Equal(expectedContent, requesterDownload);

        var assigneeLoginData = await _client.LogInAsync(assignee.Credentials, CancellationToken.None);
        var assigneeDownload = await _client.DownloadApprovalRequestTaskBase64Async(
            assigneeLoginData.AccessToken,
            taskFile.GlobalId,
            approvalRequestTask.GlobalId,
            CancellationToken.None);
        Assert.Equal(expectedContent, assigneeDownload);
        await _client.DownloadApprovalRequestTaskBase64Async(
            assigneeLoginData.AccessToken,
            laterRequestFile.GlobalId,
            approvalRequestTask.GlobalId,
            CancellationToken.None);

        var approvalRequestFileIds = approvalRequest.RequestFiles.Select(file => file.UserFileId).ToHashSet();
        foreach (var testDataEntry in testData)
        {
            var loginData = await _client.LogInAsync(testDataEntry.Credentials, CancellationToken.None);
            var normalizedEmail = testDataEntry.Credentials.Email.ToLowerInvariant();

            var filesOwnedByUser = _db.UserFiles
                .Where(x => x.Owner != null && x.Owner.NormalizedEmail == normalizedEmail)
                .ToList();

            foreach (var file in filesOwnedByUser)
            {
                if (approvalRequestFileIds.Contains(file.Id))
                {
                    await Assert.ThrowsAsync<Exception>(async () =>
                        await _client.DeleteFileAsync(loginData.AccessToken, file.GlobalId, CancellationToken.None));
                    continue;
                }

                await _client.DeleteFileAsync(loginData.AccessToken, file.GlobalId, CancellationToken.None);
            }

            Assert.Empty(_db.UserFiles
                .Where(x => x.Owner != null && x.Owner.NormalizedEmail == normalizedEmail)
                .Where(x => !approvalRequestFileIds.Contains(x.Id))
                .ToList());
        }
    }
}
