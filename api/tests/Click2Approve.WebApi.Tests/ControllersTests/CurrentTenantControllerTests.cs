using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Click2Approve.WebApi.Models.DTOs;
using Click2Approve.WebApi.Tests.Extensions;
using Click2Approve.WebApi.Tests.Models;

namespace Click2Approve.WebApi.Tests.ControllersTests;

public class CurrentTenantControllerTests(CustomWebApplicationFactory<Program> applicationFactory) : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly CustomWebApplicationFactory<Program> _applicationFactory = applicationFactory;

    [Fact]
    public async Task GetCurrentAsync_WithoutBearerToken_ReturnsUnauthorized()
    {
        var response = await _applicationFactory.CreateClient().GetAsync("api/tenant/current");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetCurrentAsync_ReturnsAuthenticatedUsersPersonalTenant()
    {
        var credentials = new Credentials { Email = $"tenant-{Guid.NewGuid()}@example.com", Password = "ZAQ12wsx!" };
        await _applicationFactory.CreateClient().RegisterAsync(credentials, CancellationToken.None);

        var client = _applicationFactory.CreateClient();
        var login = await client.LogInAsync(credentials, CancellationToken.None);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login.AccessToken);

        var tenant = await client.GetFromJsonAsync<CurrentTenantDto>("api/tenant/current");

        Assert.NotNull(tenant);
        Assert.True(tenant.Id > 0);
    }
}
