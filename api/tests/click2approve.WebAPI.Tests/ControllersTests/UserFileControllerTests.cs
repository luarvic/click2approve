using System.Net;
using click2approve.WebAPI.Models;
using click2approve.WebAPI.Tests.Extensions;
using click2approve.WebAPI.Tests.Helpers;
using click2approve.WebAPI.Tests.Models;
using Microsoft.Extensions.DependencyInjection;

namespace click2approve.WebAPI.Tests.ControllersTests;

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
    ///     5. Owners can delete their files.
    /// </summary>
    [Fact]
    public async Task AllEndpoints_WhenRequestedWithBearerToken_ShouldWorkProperly()
    {
        // Arrange test data.
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

        // Register users.
        foreach (var testDataEntry in testData)
        {
            await _client.RegisterAsync(testDataEntry.Credentials, CancellationToken.None);
        }

        // 1. Uploading files works correctly.
        foreach (var testDataEntry in testData)
        {
            // Log in.
            var loginData = await _client.LogInAsync(testDataEntry.Credentials, CancellationToken.None);

            var uploadedFiles = await _client.UploadTextFilesAsync(loginData.AccessToken, testDataEntry.FilesToUpload, CancellationToken.None);
            Assert.Equal(testDataEntry.FilesToUpload.Count, uploadedFiles.Count);
        }

        // 2. Owners can list their files.
        foreach (var testDataEntry in testData)
        {
            // Log in.
            var loginData = await _client.LogInAsync(testDataEntry.Credentials, CancellationToken.None);

            var userFiles = await _client.ListFilesAsync(loginData.AccessToken, CancellationToken.None);
            Assert.Equal(testDataEntry.FilesToUpload.Count, userFiles.Count);
            foreach (var file in testDataEntry.FilesToUpload)
            {
                Assert.Contains(userFiles, f => f.Name == file.Key);
            }
        }

        // 3. Owners can download their files.
        foreach (var testDataEntry in testData)
        {
            // Log in.
            var loginData = await _client.LogInAsync(testDataEntry.Credentials, CancellationToken.None);

            // Take files owned by user.
            var filesOwnedByUser = _db.UserFiles
                .Where(x => x.Owner.NormalizedEmail!.Equals(testDataEntry.Credentials.Email.ToUpper()))
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

        // 4. Users cannot download and delete files owned by other users.
        foreach (var testDataEntry in testData)
        {
            // Log in.
            var loginData = await _client.LogInAsync(testDataEntry.Credentials, CancellationToken.None);

            // Take files owned by other users.
            var filesOwnedByOtherUsers = _db.UserFiles
                .Where(x => !x.Owner.NormalizedEmail!.Equals(testDataEntry.Credentials.Email.ToUpper()))
                .ToList();

            foreach (var file in filesOwnedByOtherUsers)
            {
                await Assert.ThrowsAsync<Exception>(async () =>
                    await _client.DownloadFileAsync(loginData.AccessToken, file.Id, CancellationToken.None));
                await Assert.ThrowsAsync<Exception>(async () =>
                    await _client.DeleteFileAsync(loginData.AccessToken, file.Id, CancellationToken.None));
            }
        }

        // TBD Approvers can download files but cannot delete files.

        // 5. Owners can delete their files.
        foreach (var testDataEntry in testData)
        {
            // Log in.
            var loginData = await _client.LogInAsync(testDataEntry.Credentials, CancellationToken.None);

            // Take files owned by user.
            var filesOwnedByUser = _db.UserFiles
                .Where(x => x.Owner.NormalizedEmail!.Equals(testDataEntry.Credentials.Email.ToUpper()))
                .ToList();

            // Delete files.
            foreach (var file in filesOwnedByUser)
            {
                var originalFile = testDataEntry.FilesToUpload.Single(f => f.Key == file.Name);
                await _client.DeleteFileAsync(loginData.AccessToken, file.Id, CancellationToken.None);
            }

            Assert.Empty(_db.UserFiles
                .Where(x => x.Owner.NormalizedEmail!.Equals(testDataEntry.Credentials.Email.ToUpper()))
                .ToList());
        }
    }
}
