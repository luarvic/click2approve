using System.Text;
using click2approve.WebAPI.Models;
using click2approve.WebAPI.Tests.Helpers;
using click2approve.WebAPI.Tests.Models;
using Newtonsoft.Json;

namespace click2approve.WebAPI.Tests.Extensions;

/// <summary>
/// Extends HttpClient class with methods required for testing.
/// </summary>
public static class HttpClientExtensions
{
    /// <summary>
    /// Registers a user by sending POST request to api/account/register endpoint.
    /// </summary>
    public static async Task RegisterAsync(this HttpClient httpClient, Credentials credentials, CancellationToken cancellationToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "api/account/register")
        {
            Content = new StringContent(JsonConvert.SerializeObject(credentials), Encoding.UTF8, "application/json")
        };
        var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode) throw new Exception($"Registration failed for {credentials.Email}.");
    }

    /// <summary>
    /// Logs in a user by sending POST request to api/account/login endpoint.
    /// </summary>
    public static async Task<LoginResponseContent> LogInAsync(this HttpClient httpClient, Credentials credentials, CancellationToken cancellationToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "api/account/login")
        {
            Content = new StringContent(JsonConvert.SerializeObject(credentials), Encoding.UTF8, "application/json")
        };
        var response = await httpClient.SendAsync(request, cancellationToken);
        var errorMessage = $"Login failed for {credentials.Email}.";
        if (!response.IsSuccessStatusCode) throw new Exception(errorMessage);
        var loginResponseJson = await response.Content.ReadAsStringAsync(cancellationToken) ?? throw new Exception(errorMessage);
        return JsonConvert.DeserializeObject<LoginResponseContent>(loginResponseJson) ?? throw new Exception(errorMessage);
    }

    /// <summary>
    /// Uploads text files by sending POST request to api/file/upload endpoint.
    /// </summary>
    public static async Task<List<UserFile>> UploadTextFilesAsync(this HttpClient httpClient,
        string accessToken,
        Dictionary<string, string> files,
        CancellationToken cancellationToken)
    {
        var formContent = new MultipartFormDataContent();
        foreach (var file in files)
        {
            formContent.Add(Converters.GetStreamContentFromBytes(Encoding.UTF8.GetBytes(file.Value)), "files", file.Key);
        }
        var request = new HttpRequestMessage(HttpMethod.Post, "api/file/upload")
        {
            Content = formContent
        };
        request.Headers.Add("Authorization", $"Bearer {accessToken}");
        var response = await httpClient.SendAsync(request, cancellationToken);
        var errorMessage = "Failed uploading files.";
        if (!response.IsSuccessStatusCode) throw new Exception(errorMessage);
        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken) ?? throw new Exception(errorMessage);
        return JsonConvert.DeserializeObject<List<UserFile>>(responseJson) ?? throw new Exception(errorMessage);
    }

    /// <summary>
    /// Lists files by sending GET request to api/file/list endpoint.
    /// </summary>
    public static async ValueTask<List<UserFile>> ListFilesAsync(this HttpClient httpClient,
        string accessToken,
        CancellationToken cancellationToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "api/file/list");
        request.Headers.Add("Authorization", $"Bearer {accessToken}");
        var response = await httpClient.SendAsync(request, cancellationToken);
        var errorMessage = "Failed listing files.";
        if (!response.IsSuccessStatusCode) throw new Exception(errorMessage);
        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken) ?? throw new Exception(errorMessage);
        return JsonConvert.DeserializeObject<List<UserFile>>(responseJson) ?? throw new Exception(errorMessage);
    }

    /// <summary>
    /// Downloads a file by sending GET request to api/file/download endpoint.
    /// </summary>
    public static async Task<string> DownloadFileAsync(this HttpClient httpClient,
    string accessToken,
    long id,
    CancellationToken cancellationToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, $"api/file/download?id={id}");
        request.Headers.Add("Authorization", $"Bearer {accessToken}");
        var response = await httpClient.SendAsync(request, cancellationToken);
        var errorMessage = "Failed downloading file.";
        if (!response.IsSuccessStatusCode) throw new Exception(errorMessage);
        return await response.Content.ReadAsStringAsync(cancellationToken) ?? throw new Exception(errorMessage);
    }
}
