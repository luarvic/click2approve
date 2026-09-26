using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Click2Approve.WebApi.Tests.Extensions;
using Click2Approve.WebApi.Tests.Models;

namespace Click2Approve.WebApi.Tests.Helpers;

/// <summary>Owns an independently authenticated HTTP client and its personal tenant.</summary>
public sealed record ApiTestSession(HttpClient Client, string Email, string AccessToken, Guid TenantId) : IDisposable
{
    public const string Password = "StrongPassword1!";
    public string Root => $"api/v1/tenants/{TenantId}";

    public static async Task<ApiTestSession> CreateAsync(HttpClient client)
    {
        var credentials = new Credentials { Email = $"test-{Guid.NewGuid():N}@example.com", Password = Password };
        await client.RegisterAsync(credentials, default);
        var login = await client.LogInAsync(credentials, default);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login.AccessToken);
        var tenant = await client.GetCurrentTenantIdAsync(login.AccessToken, default);
        return new ApiTestSession(client, credentials.Email, login.AccessToken, tenant);
    }

    public async Task<Guid> SubmitAsync(object payload, Guid? tenantId = null)
    {
        using var response = await Client.PostAsJsonAsync($"api/v1/tenants/{tenantId ?? TenantId}/requests", payload);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<Guid>();
    }

    public async Task<Guid> UploadAsync(Guid? tenantId = null)
    {
        using var content = new MultipartFormDataContent();
        content.Add(new StringContent("Approval document"), "files", "approval.txt");
        using var response = await Client.PostAsync($"api/v1/tenants/{tenantId ?? TenantId}/files/upload", content);
        response.EnsureSuccessStatusCode();
        var files = await response.Content.ReadFromJsonAsync<JsonElement>();
        return files[0].GetProperty("globalId").GetGuid();
    }

    public void Dispose() => Client.Dispose();
}
