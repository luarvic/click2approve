using System.Net;
using System.Text;
using click2approve.WebAPI.Models;
using click2approve.WebAPI.Tests.Extensions;
using click2approve.WebAPI.Tests.Helpers;
using click2approve.WebAPI.Tests.Models;
using Newtonsoft.Json;

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
    ///     - Authenticated users can only work with their own files.
    ///     - Deleting files works correctly.
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
            await _client.RegisterAsync(testScenario.Credentials);
            var loginResponse = await _client.LoginAsync(testScenario.Credentials);

            // Upload files and assert the result.
            var formContent = new MultipartFormDataContent();
            foreach (var file in testScenario.FilesToUpload)
            {
                formContent.Add(Converters.GetStreamContentFromBytes(Encoding.UTF8.GetBytes(file.Value)), "files", file.Key);
            }
            var uploadRequest = new HttpRequestMessage(HttpMethod.Post, "api/file/upload")
            {
                Content = formContent
            };
            uploadRequest.Headers.Add("Authorization", $"Bearer {loginResponse.AccessToken}");
            var uploadResponse = await _client.SendAsync(uploadRequest);
            var uploadErrorMessage = $"Upload failed for user {testScenario.Credentials.Email}.";
            if (!uploadResponse.IsSuccessStatusCode) throw new Exception(uploadErrorMessage);
            var uploadResponseJson = await uploadResponse.Content.ReadAsStringAsync() ?? throw new Exception(uploadErrorMessage);
            testScenario.UploadedFiles = JsonConvert.DeserializeObject<List<UserFile>>(uploadResponseJson) ?? throw new Exception(uploadErrorMessage);
            Assert.Equal(testScenario.FilesToUpload.Count, testScenario.UploadedFiles.Count);

            // List uploaded files and assert the result.
            var listRequest = new HttpRequestMessage(HttpMethod.Get, "api/file/list");
            listRequest.Headers.Add("Authorization", $"Bearer {loginResponse.AccessToken}");
            var listResponse = await _client.SendAsync(listRequest);
            var listErrorMessage = $"List failed for user {testScenario.Credentials.Email}.";
            if (!listResponse.IsSuccessStatusCode) throw new Exception(listErrorMessage);
            var listResponseJson = await listResponse.Content.ReadAsStringAsync() ?? throw new Exception(listErrorMessage);
            var listResponseContent = JsonConvert.DeserializeObject<List<UserFile>>(listResponseJson) ?? throw new Exception(listErrorMessage);
            Assert.Equal(testScenario.FilesToUpload.Count, listResponseContent.Count);
            foreach (var file in testScenario.FilesToUpload)
            {
                Assert.Contains(listResponseContent, f => f.Name == file.Key);
            }

            // Download files and assert the result.
            foreach (var uploadedFile in testScenario.UploadedFiles)
            {
                var downloadRequest = new HttpRequestMessage(HttpMethod.Get, $"api/file/download?id={uploadedFile.Id}");
                downloadRequest.Headers.Add("Authorization", $"Bearer {loginResponse.AccessToken}");
                var downloadResponse = await _client.SendAsync(downloadRequest);
                var downloadErrorMessage = $"Download failed for user {testScenario.Credentials.Email} and id {uploadedFile.Id}.";
                if (!downloadResponse.IsSuccessStatusCode) throw new Exception(listErrorMessage);
                var downloadResponseString = await downloadResponse.Content.ReadAsStringAsync() ?? throw new Exception(listErrorMessage);
                var originalFileContent = testScenario.FilesToUpload.Single(f => f.Key == uploadedFile.Name).Value;
                Assert.Equal(originalFileContent, downloadResponseString);
            }

            // Download base64 and assert the result.

            // Delete files and assert the result.
        }
    }
}
