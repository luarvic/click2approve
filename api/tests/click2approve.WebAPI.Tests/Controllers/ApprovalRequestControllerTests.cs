using System.Net;

namespace click2approve.WebAPI.Tests.Controllers;

public class ApprovalRequestControllerTests(CustomWebApplicationFactory<Program> applicationFactory) : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly Uri baseUrl = new("http://localhost:5555");
    private readonly CustomWebApplicationFactory<Program> _applicationFactory = applicationFactory;

    [Theory]
    [InlineData("POST", "api/request")]
    [InlineData("DELETE", "api/request")]
    [InlineData("GET", "api/request/list")]
    public async Task Requests_WithoutBearerToken_ShouldReturnUnauthorized(string httpMethod, string url)
    {
        var client = _applicationFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Parse(httpMethod), url);
        var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
