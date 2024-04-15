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
        var testScenarios = new List<UserFileControllerTestScenario>
        {
            new()
            {
                Credentials = new Credentials { Email = "first@foo.com", Password = "ZAQ12wsx!" },
                Files = new Dictionary<string, string>
                {
                    { "one.txt", "One" },
                    { "two.txt", "Two" }
                }
            },
            new()
            {
                Credentials = new Credentials { Email = "second@foo.com", Password = "ZAQ12wsx!" },
                Files = new Dictionary<string, string>
                {
                    { "three.txt", "Three" }
                }
            },
        };

        foreach (var testScenario in testScenarios)
        {
            // Upload files.
            await _client.RegisterAsync(testScenario.Credentials);
            var loginResponse = await _client.LoginAsync(testScenario.Credentials);
            var formContent = new MultipartFormDataContent();
            foreach (var file in testScenario.Files)
            {
                formContent.Add(Converters.GetStreamContentFromBytes(Encoding.UTF8.GetBytes(file.Key)), "files", file.Key);
            }
            var uploadRequest = new HttpRequestMessage(HttpMethod.Post, "api/file/upload")
            {
                Content = formContent
            };
            uploadRequest.Headers.Add("Authorization", $"Bearer {loginResponse.AccessToken}");
            await _client.SendAsync(uploadRequest);

            // List uploaded files and assert the result.
            var listRequest = new HttpRequestMessage(HttpMethod.Get, "api/file/list");
            listRequest.Headers.Add("Authorization", $"Bearer {loginResponse.AccessToken}");
            var listResponse = await _client.SendAsync(listRequest);
            var errorMessage = $"List failed for user {testScenario.Credentials.Email}.";
            if (!listResponse.IsSuccessStatusCode) throw new Exception(errorMessage);
            var listResponseJson = await listResponse.Content.ReadAsStringAsync() ?? throw new Exception(errorMessage);
            var listResponseContent = JsonConvert.DeserializeObject<List<UserFile>>(listResponseJson) ?? throw new Exception(errorMessage);
            Assert.Equal(testScenario.Files.Count, listResponseContent.Count);
            foreach (var file in testScenario.Files)
            {
                Assert.Contains(listResponseContent, f => f.Name == file.Key);
            }

            // Download files and assert the result.

            // Download base64 and assert the result.

            // Delete files and assert the result.
        }
    }
}
