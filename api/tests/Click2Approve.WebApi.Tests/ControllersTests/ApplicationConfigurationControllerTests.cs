using System.Net;
using System.Net.Http.Json;
using Click2Approve.WebApi.Models.DTOs;

namespace Click2Approve.WebApi.Tests.ControllersTests;

/// <summary>
/// Tests application configuration API endpoints.
/// </summary>
public class ApplicationConfigurationControllerTests(CustomWebApplicationFactory<Program> applicationFactory) : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client = applicationFactory.CreateClient();

    [Fact]
    public async Task GetConfiguration_ReturnsIdentityConfirmationRequirement()
    {
        var response = await _client.GetAsync("api/v1/products/info");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var configuration = await response.Content.ReadFromJsonAsync<ApplicationConfigurationDto>();
        Assert.NotNull(configuration);
        Assert.False(configuration.RequiresConfirmedEmail);
    }
}
