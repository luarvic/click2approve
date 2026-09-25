using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Click2Approve.Application.Abstractions.Identity;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Tests.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.WebApi.Tests.ControllersTests;

/// <summary>Verifies global identifiers across native Identity and passkey API boundaries.</summary>
public sealed class GlobalIdentityTests
{
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task AccountFlow_UsesGlobalIdAndPreservesInternalAuditActor(bool activatePlaceholder)
    {
        await using var factory = new CustomWebApplicationFactory<Program>().WithWebHostBuilder(builder =>
            builder.UseSetting("Authentication:VerificationEnabled", "true"));
        using var client = factory.CreateClient();
        var credentials = new Credentials
        {
            Email = $"global-id-{Guid.NewGuid()}@example.com",
            Password = "ZAQ12wsx!"
        };
        Guid? placeholderGlobalId = null;
        if (activatePlaceholder)
        {
            await using var scope = factory.Services.CreateAsyncScope();
            var provisioner = scope.ServiceProvider.GetRequiredService<IUserProvisioningService>();
            placeholderGlobalId = (await provisioner.EnsureUserAsync(credentials.Email, CancellationToken.None)).GlobalId;
        }

        (await client.PostAsJsonAsync("api/v1/account/register", credentials)).EnsureSuccessStatusCode();

        Guid globalId;
        long internalId;
        string confirmationLink;
        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
            var user = await db.Users.SingleAsync(user => user.Email == credentials.Email);
            globalId = user.GlobalId;
            internalId = user.Id;
            if (placeholderGlobalId.HasValue)
                Assert.Equal(placeholderGlobalId.Value, globalId);
            var manager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            Assert.Equal(globalId.ToString(), await manager.GetUserIdAsync(user));
            Assert.Null(await manager.FindByIdAsync(internalId.ToString()));
            Assert.Null(await manager.FindByIdAsync("invalid"));
            Assert.Equal(internalId, (await manager.FindByIdAsync(globalId.ToString()))!.Id);
            var principal = await scope.ServiceProvider.GetRequiredService<SignInManager<AppUser>>()
                .CreateUserPrincipalAsync(user);
            Assert.Equal(globalId.ToString(), principal.FindFirstValue(ClaimTypes.NameIdentifier));
            var emails = (await db.EventOutboxMessages.ToListAsync())
                .Select(message => JsonSerializer.Deserialize<AccountEmailRequestedPayload>(message.Payload, EventJson.Options))
                .Where(payload => payload?.ToAddress == credentials.Email && payload.ConfirmationLink is not null);
            confirmationLink = Assert.Single(emails)!.ConfirmationLink!;
        }

        var confirmationUri = new Uri(WebUtility.HtmlDecode(confirmationLink));
        Assert.Equal(globalId.ToString(), QueryHelpers.ParseQuery(confirmationUri.Query)["userId"]);
        var numericLink = confirmationUri.PathAndQuery.Replace(globalId.ToString(), internalId.ToString());
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync(numericLink)).StatusCode);
        (await client.GetAsync(confirmationUri.PathAndQuery)).EnsureSuccessStatusCode();

        var login = await client.PostAsJsonAsync("api/v1/account/login", credentials);
        login.EnsureSuccessStatusCode();
        var tokens = (await login.Content.ReadFromJsonAsync<LoginResponse>())!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        (await client.GetAsync("api/v1/userProfiles")).EnsureSuccessStatusCode();
        var options = await client.PostAsync("api/v1/account/passkeys/registration/options", content: null);
        options.EnsureSuccessStatusCode();
        var json = await options.Content.ReadFromJsonAsync<JsonElement>();
        var userHandle = WebEncoders.Base64UrlDecode(json.GetProperty("user").GetProperty("id").GetString()!);
        Assert.Equal(globalId.ToString(), Encoding.UTF8.GetString(userHandle));

        var refresh = await client.PostAsJsonAsync("api/v1/account/refresh", new { tokens.RefreshToken });
        refresh.EnsureSuccessStatusCode();
        var refreshed = (await refresh.Content.ReadFromJsonAsync<LoginResponse>())!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", refreshed.AccessToken);
        (await client.GetAsync("api/v1/userProfiles")).EnsureSuccessStatusCode();

        await using var auditScope = factory.Services.CreateAsyncScope();
        var auditDb = auditScope.ServiceProvider.GetRequiredService<ApiDbContext>();
        Assert.True(await auditDb.AuditLogs.AnyAsync(log => log.UserId == internalId));
    }
}
