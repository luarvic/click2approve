using System.Net.Http.Json;
using System.Net.Mime;
using System.Text;
using System.Text.Json;
using Click2Approve.WebApi.Models;
using Click2Approve.WebApi.Models.DTOs;
using Click2Approve.WebApi.Tests.Helpers;
using Click2Approve.WebApi.Tests.Models;

namespace Click2Approve.WebApi.Tests.Extensions;

/// <summary>
/// Extends HttpClient class with methods required for testing.
/// </summary>
public static class HttpClientExtensions
{
    /// <summary>
    /// Sends an HTTP request.
    /// </summary>
    /// <returns>
    /// An instance of HttpContent class.
    /// </returns>
    public static async Task<HttpContent> SendAsync(this HttpClient httpClient,
        HttpMethod method,
        string url,
        Dictionary<string, string>? headers,
        Dictionary<string, string>? queryParameters,
        HttpContent? body,
        CancellationToken cancellationToken
        )
    {
        var request = new HttpRequestMessage(method, $"{url}?{Converters.GetQueryStringFromDictionary(queryParameters)}");
        if (headers != null)
        {
            foreach (var header in headers)
            {
                request.Headers.Add(header.Key, header.Value);
            }
        }
        if (body != null)
        {
            request.Content = body;
        }
        var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode) throw new Exception($"Failed sending {method} request to {url}.");
        return response.Content;
    }

    /// <summary>
    /// Sends an HTTP request.
    /// </summary>
    /// <returns>
    /// An instance of T class.
    /// </returns>
    public static async Task<T> SendAsync<T>(this HttpClient httpClient,
        HttpMethod method,
        string url,
        Dictionary<string, string>? headers,
        Dictionary<string, string>? queryParameters,
        HttpContent? body,
        CancellationToken cancellationToken
        )
    {
        var httpContent = await httpClient.SendAsync(method, url, headers, queryParameters, body, cancellationToken);
        return typeof(T) == typeof(string) ?
            (T)(object)await httpContent.ReadAsStringAsync(cancellationToken) :
            await httpContent.ReadFromJsonAsync<T>(cancellationToken)
                ?? throw new Exception($"Failed sending {method} request to {url}.");
    }

    /// <summary>
    /// Registers a user by sending POST request to api/account/register endpoint.
    /// </summary>
    public static async Task RegisterAsync(this HttpClient httpClient, Credentials credentials, CancellationToken cancellationToken)
    {
        await httpClient.SendAsync(HttpMethod.Post,
            "api/account/register",
            null,
            null,
            new StringContent(JsonSerializer.Serialize(credentials), Encoding.UTF8, "application/json"),
            cancellationToken);
    }

    /// <summary>
    /// Logs in a user by sending POST request to api/account/login endpoint.
    /// </summary>
    public static async Task<LoginResponse> LogInAsync(this HttpClient httpClient, Credentials credentials, CancellationToken cancellationToken)
    {
        return await httpClient.SendAsync<LoginResponse>(HttpMethod.Post,
            "api/account/login",
            null,
            null,
            new StringContent(JsonSerializer.Serialize(credentials), Encoding.UTF8, "application/json"),
            cancellationToken);
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
        return await httpClient.SendAsync<List<UserFile>>(HttpMethod.Post,
            "api/file/upload",
            new Dictionary<string, string> {
                {"Authorization", $"Bearer {accessToken}"}
            },
            null,
            formContent,
            cancellationToken
            );
    }

    /// <summary>
    /// Lists files by sending GET request to api/file/list endpoint.
    /// </summary>
    public static async ValueTask<List<UserFile>> ListFilesAsync(this HttpClient httpClient,
        string accessToken,
        CancellationToken cancellationToken)
    {
        return await httpClient.SendAsync<List<UserFile>>(HttpMethod.Get,
            "api/file/list",
            new Dictionary<string, string> {
                {"Authorization", $"Bearer {accessToken}"}
            },
            null,
            null,
            cancellationToken);
    }

    /// <summary>
    /// Downloads a file by sending GET request to api/file/download endpoint.
    /// </summary>
    public static async Task<string> DownloadFileAsync(this HttpClient httpClient,
    string accessToken,
    long id,
    CancellationToken cancellationToken)
    {
        return await httpClient.SendAsync<string>(HttpMethod.Get,
            "api/file/download",
            new Dictionary<string, string> {
                {"Authorization", $"Bearer {accessToken}"}
            },
            new Dictionary<string, string> {
                {"id", id.ToString()},
            },
            null,
            cancellationToken
            );
    }

    /// <summary>
    /// Downloads base64 representation of a file by sending GET request to api/file/downloadBase64 endpoint.
    /// </summary>
    public static async Task<string> DownloadBase64Async(this HttpClient httpClient,
    string accessToken,
    long id,
    CancellationToken cancellationToken)
    {
        return await httpClient.SendAsync<string>(HttpMethod.Get,
            "api/file/downloadBase64",
            new Dictionary<string, string> {
                {"Authorization", $"Bearer {accessToken}"}
            },
            new Dictionary<string, string> {
                {"id", id.ToString()},
            },
            null,
            cancellationToken
            );
    }

    /// <summary>
    /// Deletes a file by sending DELETE request to api/file endpoint.
    /// </summary>
    public static async Task<string> DeleteFileAsync(this HttpClient httpClient,
    string accessToken,
    long id,
    CancellationToken cancellationToken)
    {
        return await httpClient.SendAsync<string>(HttpMethod.Delete,
            "api/file",
            new Dictionary<string, string> {
                {"Authorization", $"Bearer {accessToken}"}
            },
            new Dictionary<string, string> {
                {"id", id.ToString()},
            },
            null,
            cancellationToken
            );
    }

    /// <summary>
    /// Submits an approval request by sending POST request to api/request endpoint.
    /// </summary>
    public static async Task<string> SubmitApprovalRequestAsync(this HttpClient httpClient,
    string accessToken,
    ApprovalRequestSubmitDto payload,
    CancellationToken cancellationToken)
    {
        var body = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            MediaTypeNames.Application.Json);
        return await httpClient.SendAsync<string>(HttpMethod.Post,
            "api/request",
            new Dictionary<string, string> {
                {"Authorization", $"Bearer {accessToken}"}
            },
            null,
            body,
            cancellationToken
            );
    }
}
