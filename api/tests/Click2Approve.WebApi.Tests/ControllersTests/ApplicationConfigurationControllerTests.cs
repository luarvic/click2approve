using System.Net;
using System.Net.Http.Json;
using Click2Approve.WebApi.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

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
        var configuration = await response.Content.ReadFromJsonAsync<ApplicationConfigurationResponse>();
        Assert.NotNull(configuration);
        Assert.False(configuration.RequiresConfirmedEmail);
        Assert.False(configuration.Capabilities.GuestApprovals);
        Assert.True(string.IsNullOrEmpty(configuration.SiteLinks.TermsUrl));
        Assert.True(string.IsNullOrEmpty(configuration.SiteLinks.PrivacyUrl));
        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync($"api/v1/guest/tasks/{Guid.NewGuid()}")).StatusCode);
    }

    [Fact]
    public void GetConfiguration_PublishesOperatorNoticesWithoutRequiringSignupAgreement()
    {
        var settings = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["SiteLinks:TermsUrl"] = "https://operator.example/terms",
            ["SiteLinks:PrivacyUrl"] = "https://operator.example/privacy"
        }).Build();
        var controller = new ApplicationConfigurationController(settings);
        var result = Assert.IsType<OkObjectResult>(controller.GetConfiguration().Result);
        var configuration = Assert.IsType<ApplicationConfigurationResponse>(result.Value);

        Assert.Equal("https://operator.example/terms", configuration.SiteLinks.TermsUrl);
        Assert.Equal("https://operator.example/privacy", configuration.SiteLinks.PrivacyUrl);
        Assert.Null(configuration.RegistrationLegal);
    }
}
