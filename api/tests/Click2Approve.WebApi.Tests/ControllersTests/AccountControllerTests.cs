using System.Net.Http.Json;
using Click2Approve.Application.Services.Identity;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Tests.Extensions;
using Click2Approve.WebApi.Tests.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.WebApi.Tests.ControllersTests;

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
