using System.Net;
using System.Net.Http.Headers;
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

    [Fact]
    public async Task ListPasskeys_WithMultipleCredentials_ReturnsAll()
    {
        await using var factory = CreateFactory(verificationEnabled: false);
        var email = await CreateUserAsync(factory, confirmed: true, mfa: false);
        const string secondCredentialId = "BAUG";
        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            var user = (await users.FindByEmailAsync(email))!;
            Assert.True((await users.AddLoginAsync(user,
                new UserLoginInfo(Provider, secondCredentialId, Provider))).Succeeded);
            var passkey = new StoredPasskeyCredential
            {
                CredentialId = secondCredentialId,
                Name = "Second device",
                PublicKey = "AQID"
            };
            Assert.True((await users.SetAuthenticationTokenAsync(
                user, Provider, secondCredentialId, JsonSerializer.Serialize(passkey))).Succeeded);
        }

        using var client = factory.CreateClient();
        var authentication = await AuthenticateAsync(client);
        authentication.EnsureSuccessStatusCode();
        var tokens = (await authentication.Content.ReadFromJsonAsync<AccessTokenResponse>())!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);

        var response = await client.GetAsync("api/v1/account/passkeys");
        response.EnsureSuccessStatusCode();
        var passkeys = (await response.Content.ReadFromJsonAsync<JsonElement>()).EnumerateArray()
            .Select(passkey => passkey.GetProperty("credentialId").GetString())
            .ToArray();
        Assert.Contains(CredentialId, passkeys);
        Assert.Contains(secondCredentialId, passkeys);
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
