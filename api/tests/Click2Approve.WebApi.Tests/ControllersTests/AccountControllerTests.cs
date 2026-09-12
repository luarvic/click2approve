using System.Net;
using System.Net.Http.Json;
using Click2Approve.Application.Abstractions.Identity;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Tests.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.WebApi.Tests.ControllersTests;

/// <summary>
/// Tests account API endpoints.
/// </summary>
public class AccountControllerTests(CustomWebApplicationFactory<Program> applicationFactory) : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly CustomWebApplicationFactory<Program> _applicationFactory = applicationFactory;

    [Fact]
    public async Task RegisterAsync_WithPlaceholderUser_ActivatesPlaceholder()
    {
        var email = $"employee-{Guid.NewGuid()}@example.com";
        var credentials = new Credentials { Email = email, Password = "ZAQ12wsx!" };

        await using (var scope = _applicationFactory.Services.CreateAsyncScope())
        {
            var userProvisioningService = scope.ServiceProvider.GetRequiredService<IUserProvisioningService>();
            var placeholder = await userProvisioningService.EnsureUserAsync(email, CancellationToken.None);

            Assert.True(placeholder.IsPlaceholder);
        }

        var response = await _applicationFactory.CreateClient().PostAsJsonAsync(
            "api/v1/account/register",
            credentials,
            CancellationToken.None);

        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync(CancellationToken.None));
        await using (var scope = _applicationFactory.Services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
            var users = await db.Users
                .Where(user => user.Email == email)
                .ToListAsync(CancellationToken.None);

            var user = Assert.Single(users);
            Assert.False(user.IsPlaceholder);
            Assert.Equal(email, user.UserName);
        }
    }
}

/// <summary>
/// Tests account API rate limits.
/// </summary>
public class AccountRateLimitingTests
{
    [Theory]
    [InlineData("api/v1/account/forgotPassword")]
    [InlineData("api/v1/account/resendConfirmationEmail")]
    public async Task PasswordAndConfirmationEndpointsAsync_ExceedingLimit_ReturnsTooManyRequests(string endpoint)
    {
        await using var applicationFactory = new CustomWebApplicationFactory<Program>().WithWebHostBuilder(
            builder => builder.UseSetting("RateLimiting:Identity:EmailPermitLimit", "3"));
        var client = applicationFactory.CreateClient();
        var email = $"account-rate-limit-{Guid.NewGuid()}@example.com";
        var registrationResponse = await client.PostAsJsonAsync(
            "api/v1/account/register",
            new Credentials { Email = email, Password = "ZAQ12wsx!" },
            CancellationToken.None);

        Assert.True(
            registrationResponse.IsSuccessStatusCode,
            await registrationResponse.Content.ReadAsStringAsync(CancellationToken.None));

        for (var requestNumber = 0; requestNumber < 3; requestNumber++)
        {
            var response = await client.PostAsJsonAsync(
                endpoint,
                new { Email = email },
                CancellationToken.None);

            Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync(CancellationToken.None));
        }

        var rateLimitedResponse = await client.PostAsJsonAsync(
            endpoint,
            new { Email = email },
            CancellationToken.None);

        Assert.Equal(HttpStatusCode.TooManyRequests, rateLimitedResponse.StatusCode);
    }

    [Fact]
    public async Task RegisterAsync_IsNotRateLimited()
    {
        await using var applicationFactory = new CustomWebApplicationFactory<Program>().WithWebHostBuilder(
            builder => builder.UseSetting("RateLimiting:Identity:EmailPermitLimit", "3"));
        var client = applicationFactory.CreateClient();

        for (var requestNumber = 0; requestNumber < 3; requestNumber++)
        {
            var response = await client.PostAsJsonAsync(
                "api/v1/account/register",
                new Credentials
                {
                    Email = $"account-rate-limit-{requestNumber}-{Guid.NewGuid()}@example.com",
                    Password = "ZAQ12wsx!"
                },
                CancellationToken.None);

            Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync(CancellationToken.None));
        }

        var registrationResponse = await client.PostAsJsonAsync(
            "api/v1/account/register",
            new Credentials
            {
                Email = $"account-rate-limit-{Guid.NewGuid()}@example.com",
                Password = "ZAQ12wsx!"
            },
            CancellationToken.None);

        Assert.True(
            registrationResponse.IsSuccessStatusCode,
            await registrationResponse.Content.ReadAsStringAsync(CancellationToken.None));
    }
}
