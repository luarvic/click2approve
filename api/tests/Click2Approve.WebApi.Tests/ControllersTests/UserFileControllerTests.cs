using System.Net;
using Click2Approve.Application.Models.DTOs;
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
    [InlineData("POST", "api/file/upload")]
    [InlineData("GET", "api/file/list")]
    [InlineData("GET", "api/file/download")]
    [InlineData("GET", "api/file/downloadBase64")]
    [InlineData("GET", "api/file/downloadBase64ForApprovalRequest")]
    [InlineData("GET", "api/file/downloadBase64ForApprovalRequestTask")]
    [InlineData("DELETE", "api/file")]
    public async Task AllEndpoints_WhenRequestedWithoutBearerToken_ShouldReturnUnauthorized(string httpMethod, string url)
    {
        var request = new HttpRequestMessage(HttpMethod.Parse(httpMethod), url);
        var response = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    /// <summary>
    /// Tests if:
    ///     1. Uploading files works correctly.
    ///     2. Owners can list their files.
    ///     3. Owners can download their files.
    ///     4. Users cannot download and delete files owned by other users.
    ///     5. Approvers can download files attached to their task only through the task endpoint.
    ///     6. Approvers cannot download files added to the request after their task was issued.
    ///     7. Owners can delete unattached files.
    ///     8. Owners cannot delete files attached to approval requests.
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
            var loginData = await _client.LogInAsync(testDataEntry.Credentials, CancellationToken.None);

            var userFiles = await _client.ListFilesAsync(loginData.AccessToken, CancellationToken.None);
            Assert.Equal(testDataEntry.FilesToUpload.Count, userFiles.Count);
            foreach (var file in testDataEntry.FilesToUpload)
            {
                Assert.Contains(userFiles, f => f.Name == file.Key);
            }
        }

        foreach (var testDataEntry in testData)
        {
            var loginData = await _client.LogInAsync(testDataEntry.Credentials, CancellationToken.None);
            var normalizedEmail = testDataEntry.Credentials.Email.ToUpperInvariant();

            var filesOwnedByUser = _db.UserFiles
                .Where(x => x.Owner != null && x.Owner.NormalizedEmail == normalizedEmail)
                .ToList();

            foreach (var file in filesOwnedByUser)
            {
                var originalFile = testDataEntry.FilesToUpload.Single(f => f.Key == file.Name);

                var downloadedFileContent = await _client.DownloadFileAsync(loginData.AccessToken, file.Id, CancellationToken.None);
                Assert.Equal(originalFile.Value, downloadedFileContent);

                var downloadFileBase64 = await _client.DownloadBase64Async(loginData.AccessToken, file.Id, CancellationToken.None);
                var originalFileBase64 = $"data:{MimeTypes.GetMimeType(originalFile.Key)};base64,{Converters.GetBase64FromString(originalFile.Value)}";
                Assert.Equal(originalFileBase64, downloadFileBase64);
            }
        }

        foreach (var testDataEntry in testData)
        {
            var loginData = await _client.LogInAsync(testDataEntry.Credentials, CancellationToken.None);
            var normalizedEmail = testDataEntry.Credentials.Email.ToUpperInvariant();

            var filesOwnedByOtherUsers = _db.UserFiles
                .Where(x => x.Owner != null && x.Owner.NormalizedEmail != normalizedEmail)
                .ToList();

            foreach (var file in filesOwnedByOtherUsers)
            {
                await Assert.ThrowsAsync<Exception>(async () =>
                    await _client.DownloadFileAsync(loginData.AccessToken, file.Id, CancellationToken.None));
                await Assert.ThrowsAsync<Exception>(async () =>
                    await _client.DeleteFileAsync(loginData.AccessToken, file.Id, CancellationToken.None));
            }
        }

        var requester = testData.First();
        var approver = testData.First(x => x.Credentials.Email != requester.Credentials.Email);
        var requesterNormalizedEmail = requester.Credentials.Email.ToUpperInvariant();
        var filesOwnedByRequester = _db.UserFiles
            .Where(x => x.Owner != null && x.Owner.NormalizedEmail == requesterNormalizedEmail)
            .ToList();
        var taskFile = filesOwnedByRequester.First();
        var laterRequestFile = filesOwnedByRequester.Single(file => file.Id != taskFile.Id);
        var payload = new ApprovalRequestSubmitDto
        {
            Title = "File access approval",
            UserFileIds = [taskFile.Id],
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
                            Email = approver.Credentials.Email,
                            CanViewRequest = false
                        }
                    ]
                }
            ]
        };

        var requesterLoginData = await _client.LogInAsync(requester.Credentials, CancellationToken.None);
        await _client.SubmitApprovalRequestAsync(requesterLoginData.AccessToken, payload, CancellationToken.None);

        var approvalRequest = _db.ApprovalRequests
            .Include(request => request.UserFiles)
            .Include(request => request.Tasks)
            .Single(request => request.UserFiles.Any(file => file.Id == taskFile.Id));
        approvalRequest.UserFiles.Add(laterRequestFile);
        await _db.SaveChangesAsync();

        await _client.DownloadApprovalRequestBase64Async(
            requesterLoginData.AccessToken,
            taskFile.Id,
            approvalRequest.Id,
            CancellationToken.None);

        var approverLoginData = await _client.LogInAsync(approver.Credentials, CancellationToken.None);
        await Assert.ThrowsAsync<Exception>(() =>
            _client.DownloadFileAsync(approverLoginData.AccessToken, taskFile.Id, CancellationToken.None));
        await Assert.ThrowsAsync<Exception>(() =>
            _client.DownloadBase64Async(approverLoginData.AccessToken, taskFile.Id, CancellationToken.None));
        await _client.DownloadApprovalRequestTaskBase64Async(
            approverLoginData.AccessToken,
            taskFile.Id,
            Assert.Single(approvalRequest.Tasks).Id,
            CancellationToken.None);
        await _client.DownloadApprovalRequestTaskBase64Async(
            approverLoginData.AccessToken,
            laterRequestFile.Id,
            Assert.Single(approvalRequest.Tasks).Id,
            CancellationToken.None);
        await Assert.ThrowsAsync<Exception>(() =>
            _client.DownloadBase64Async(approverLoginData.AccessToken, laterRequestFile.Id, CancellationToken.None));

        var approvalRequestFileIds = approvalRequest.UserFiles.Select(file => file.Id).ToHashSet();
        foreach (var testDataEntry in testData)
        {
            var loginData = await _client.LogInAsync(testDataEntry.Credentials, CancellationToken.None);
            var normalizedEmail = testDataEntry.Credentials.Email.ToUpperInvariant();

            var filesOwnedByUser = _db.UserFiles
                .Where(x => x.Owner != null && x.Owner.NormalizedEmail == normalizedEmail)
                .ToList();

            foreach (var file in filesOwnedByUser)
            {
                if (approvalRequestFileIds.Contains(file.Id))
                {
                    await Assert.ThrowsAsync<Exception>(async () =>
                        await _client.DeleteFileAsync(loginData.AccessToken, file.Id, CancellationToken.None));
                    continue;
                }

                await _client.DeleteFileAsync(loginData.AccessToken, file.Id, CancellationToken.None);
            }

            Assert.Empty(_db.UserFiles
                .Where(x => x.Owner != null && x.Owner.NormalizedEmail == normalizedEmail)
                .Where(x => !approvalRequestFileIds.Contains(x.Id))
                .ToList());
        }
    }
}
