using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace click2approve.WebAPI.Tests.Controllers;

public class ApprovalRequestControllerTests(CustomWebApplicationFactory<Program> applicationFactory) : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly Uri baseUrl = new("http://localhost:5555");
    private readonly CustomWebApplicationFactory<Program> _applicationFactory = applicationFactory;

    [Theory]
    [InlineData("POST", "api/request")]
    public async Task Requests_WithoutBearerToken_ShouldReturnUnauthorized(string httpMethod, string url)
    {
        HttpResponseMessage response = new();
        var client = _applicationFactory.CreateClient();
        switch (httpMethod)
        {
            case "POST":
                response = await client.PostAsync(new Uri(baseUrl, url), new StringContent(""));
                break;
        }

        // Assert
        ; // Status Code 200-299
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
