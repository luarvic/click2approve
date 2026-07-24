using System.Net;
using System.Net.Http.Json;
using Click2Approve.WebApi.Models.DTOs;

namespace Click2Approve.WebApi.Tests.ControllersTests;

public class ProductControllerTests(CustomWebApplicationFactory<Program> applicationFactory) : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client = applicationFactory.CreateClient();

    [Fact]
    public async Task GetInfo_ReturnsIdentityConfirmationRequirement()
    {
        var response = await _client.GetAsync("api/v1/products/info");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var productInfo = await response.Content.ReadFromJsonAsync<ProductInfoDto>();
        Assert.NotNull(productInfo);
        Assert.False(productInfo.RequiresConfirmedEmail);
    }
}
