using System.Text;
using click2approve.WebAPI.Tests.Models;
using Newtonsoft.Json;

namespace click2approve.WebAPI.Tests.Extensions;

/// <summary>
/// Extends HttpClient class with methods required for testing.
/// </summary>
public static class HttpClientExtensions
{
    /// <summary>
    /// Registers a user.
    /// </summary>
    public static async Task RegisterAsync(this HttpClient httpClient, Credentials credentials)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "api/account/register")
        {
            Content = new StringContent(JsonConvert.SerializeObject(credentials), Encoding.UTF8, "application/json")
        };
        var response = await httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode) throw new Exception($"Registration failed for {credentials.Email}.");
    }

    /// <summary>
    /// Logs in a user.
    /// </summary>
    public static async Task<LoginResponseContent> LoginAsync(this HttpClient httpClient, Credentials credentials)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "api/account/login")
        {
            Content = new StringContent(JsonConvert.SerializeObject(credentials), Encoding.UTF8, "application/json")
        };
        var response = await httpClient.SendAsync(request);
        var errorMessage = $"Login failed for {credentials.Email}.";
        if (!response.IsSuccessStatusCode) throw new Exception(errorMessage);
        var loginResponseJson = await response.Content.ReadAsStringAsync() ?? throw new Exception(errorMessage);
        return JsonConvert.DeserializeObject<LoginResponseContent>(loginResponseJson) ?? throw new Exception(errorMessage);
    }
}
