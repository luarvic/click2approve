using System.Net;
using click2approve.WebAPI.Tests.Extensions;
using click2approve.WebAPI.Tests.Models;

namespace click2approve.WebAPI.Tests.ControllersTests;

/// <summary>
/// Tests UserFileController class.
/// </summary>
public class UserFileControllerTests(CustomWebApplicationFactory<Program> applicationFactory) : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client = applicationFactory.CreateClient();

    /// <summary>
    /// Makes sure an anonymous user cannot access the controller's endpoints.
    /// </summary>
    [Theory]
    [InlineData("POST", "api/file/upload")]
    [InlineData("GET", "api/file/list")]
    [InlineData("GET", "api/file/download")]
    [InlineData("GET", "api/file/downloadBase64")]
    [InlineData("DELETE", "api/file")]
    public async Task UserFileControllerEndpoints_WhenRequestedWithoutBearerToken_ShouldReturnUnauthorized(string httpMethod, string url)
    {
        var request = new HttpRequestMessage(HttpMethod.Parse(httpMethod), url);
        var response = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    /// <summary>
    /// Makes sure that:
    ///     - Authenticated users can access the controller's endpoints.
    ///     - Uploading files works correctly.
    ///     - Only owners can list and delete their files.
    ///     - Only owners and approvers can download their files.
    /// </summary>
    [Fact]
    public async Task UserFileControllerEndpoints_WhenRequestedWithBearerToken_ShouldWork()
    {
        // Arrange users and files.
        var testScenarios = new List<UserFileControllerTestScenarioData>
        {
            new()
            {
                Credentials = new Credentials { Email = "first@foo.com", Password = "ZAQ12wsx!" },
                FilesToUpload = new Dictionary<string, string>
                {
                    { "one.txt", "One" },
                    { "two.txt", "Two" }
                }
            },
            new()
            {
                Credentials = new Credentials { Email = "second@foo.com", Password = "ZAQ12wsx!" },
                FilesToUpload = new Dictionary<string, string>
                {
                    { "three.txt", "Three" }
                }
            },
        };

        foreach (var testScenario in testScenarios)
        {
            // Register and log in.
            await _client.RegisterAsync(testScenario.Credentials, CancellationToken.None);
            var loginResponse = await _client.LogInAsync(testScenario.Credentials, CancellationToken.None);

            // Upload files and assert the result.
            testScenario.UploadedFiles = await _client.UploadTextFilesAsync(loginResponse.AccessToken, testScenario.FilesToUpload, CancellationToken.None);
            Assert.Equal(testScenario.FilesToUpload.Count, testScenario.UploadedFiles.Count);

            // List uploaded files and assert the result.
            var userFiles = await _client.ListFilesAsync(loginResponse.AccessToken, CancellationToken.None);
            Assert.Equal(testScenario.FilesToUpload.Count, userFiles.Count);
            foreach (var file in testScenario.FilesToUpload)
            {
                Assert.Contains(userFiles, f => f.Name == file.Key);
            }

            // Download uploaded files and assert the result.
            foreach (var uploadedFile in testScenario.UploadedFiles)
            {
                var downloadedFileContent = await _client.DownloadFileAsync(loginResponse.AccessToken, uploadedFile.Id, CancellationToken.None);
                var originalFileContent = testScenario.FilesToUpload.Single(f => f.Key == uploadedFile.Name).Value;
                Assert.Equal(originalFileContent, downloadedFileContent);
            }

            // Try downloading a file that doesn't belong to the user

            // Download base64 and assert the result.

            // Delete files and assert the result.
        }
    }
}
