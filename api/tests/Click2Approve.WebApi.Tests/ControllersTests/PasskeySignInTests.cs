using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Identity.Passkeys;
using Click2Approve.WebApi.Tests.Services;
using Fido2NetLib;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.WebApi.Tests.ControllersTests;

/// <summary>Tests passkey account policy with real Identity persistence, MFA settings, and bearer issuance.</summary>
public sealed class PasskeySignInTests
{
    private const string Provider = "Click2Approve.Passkeys";
    private const string CredentialId = "AQID";
    private const string AuthenticationPath = "api/v1/account/passkeys/authentication";

    [Theory]
    [InlineData(true, false, false, false)]
    [InlineData(true, true, true, false)]
    [InlineData(false, false, true, false)]
    [InlineData(false, false, false, true)]
    [InlineData(true, true, false, true)]
    public async Task Passkey_EnforcesConfirmationAndLockout(
        bool verificationEnabled, bool confirmed, bool locked, bool allowed)
    {
        await using var factory = CreateFactory(verificationEnabled);
        var email = await CreateUserAsync(factory, confirmed, mfa: false);
        if (locked) await UpdateUserAsync(factory, email, (users, user) =>
            users.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddMinutes(10)));
        using var client = factory.CreateClient();
        var response = await AuthenticateAsync(client);
        Assert.Equal(allowed ? HttpStatusCode.OK : HttpStatusCode.Unauthorized, response.StatusCode);
        if (allowed) await AssertTokensAsync(response);
        else Assert.DoesNotContain("accessToken", await response.Content.ReadAsStringAsync());
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task VerifiedPasskey_SatisfiesMfa_WhilePasswordStillRequiresIt(bool verificationEnabled)
    {
        await using var factory = CreateFactory(verificationEnabled);
        var email = await CreateUserAsync(factory, confirmed: verificationEnabled, mfa: true);
        using var client = factory.CreateClient();
        var passwordLogin = await client.PostAsJsonAsync("api/v1/account/login",
            new { email, password = "StrongPassword1!" });
        Assert.Equal(HttpStatusCode.Unauthorized, passwordLogin.StatusCode);
        Assert.Contains("RequiresTwoFactor", await passwordLogin.Content.ReadAsStringAsync());
        await AssertTokensAsync(await AuthenticateAsync(client));
    }

    [Theory]
    [InlineData(true, false, false)]
    [InlineData(true, true, true)]
    [InlineData(false, false, true)]
    public async Task MfaEnrolledAccount_StillRequiresAccountEligibility(
        bool verificationEnabled, bool confirmed, bool locked)
    {
        await using var factory = CreateFactory(verificationEnabled);
        var email = await CreateUserAsync(factory, confirmed, mfa: true);
        if (locked) await UpdateUserAsync(factory, email, (users, user) =>
            users.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddMinutes(10)));
        using var client = factory.CreateClient();
        var response = await AuthenticateAsync(client);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.DoesNotContain("accessToken", await response.Content.ReadAsStringAsync());
    }

    private static WebApplicationFactory<Program> CreateFactory(bool verificationEnabled) =>
        new CustomWebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("Authentication:VerificationEnabled", verificationEnabled.ToString());
            builder.ConfigureServices(services => services.AddSingleton<IFido2, VerifiedAssertionFido2>());
        });

    private static async Task<string> CreateUserAsync(WebApplicationFactory<Program> factory, bool confirmed, bool mfa)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var email = $"passkey-{Guid.NewGuid():N}@example.com";
        var user = new AppUser
        {
            Email = email,
            UserName = email,
            EmailConfirmed = confirmed,
            LockoutEnabled = true
        };
        Assert.True((await users.CreateAsync(user, "StrongPassword1!")).Succeeded);
        Assert.True((await users.AddLoginAsync(user, new UserLoginInfo(Provider, CredentialId, Provider))).Succeeded);
        var passkey = new StoredPasskeyCredential { CredentialId = CredentialId, PublicKey = "AQID" };
        Assert.True((await users.SetAuthenticationTokenAsync(
            user, Provider, CredentialId, JsonSerializer.Serialize(passkey))).Succeeded);
        if (mfa)
        {
            Assert.True((await users.ResetAuthenticatorKeyAsync(user)).Succeeded);
            Assert.True((await users.SetTwoFactorEnabledAsync(user, true)).Succeeded);
        }
        return email;
    }

    private static async Task UpdateUserAsync(WebApplicationFactory<Program> factory, string email,
        Func<UserManager<AppUser>, AppUser, Task<IdentityResult>> update)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        Assert.True((await update(users, (await users.FindByEmailAsync(email))!)).Succeeded);
    }

    private static async Task<HttpResponseMessage> AuthenticateAsync(HttpClient client)
    {
        (await client.PostAsync(AuthenticationPath + "/options", content: null)).EnsureSuccessStatusCode();
        return await client.PostAsJsonAsync(AuthenticationPath, new
        {
            id = CredentialId,
            rawId = CredentialId,
            type = "public-key",
            clientExtensionResults = new { },
            response = new
            {
                authenticatorData = "AQID",
                clientDataJSON = "AQID",
                signature = "AQID",
                userHandle = "AQID"
            }
        });
    }

    private static async Task AssertTokensAsync(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        var tokens = await response.Content.ReadFromJsonAsync<AccessTokenResponse>();
        Assert.NotEmpty(tokens!.AccessToken);
        Assert.NotEmpty(tokens.RefreshToken);
    }
}
