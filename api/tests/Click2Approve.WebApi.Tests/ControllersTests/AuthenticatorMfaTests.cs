using System.Buffers.Binary;
using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Models.Responses.Identity;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.WebApi.Tests.ControllersTests;

/// <summary>Exercises the native Identity authenticator flow through the application's endpoints.</summary>
public sealed class AuthenticatorMfaTests
{
    private const string Password = "StrongPassword1!";
    private const string LoginPath = "api/v1/account/login";
    private const string ManagementPath = "api/v1/account/manage/2fa";

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Enrollment_Login_RecoveryRotation_AndRemoval_UseIdentity(bool verificationEnabled)
    {
        await using var factory = CreateFactory(verificationEnabled);
        var email = await CreateUserAsync(factory, emailConfirmed: verificationEnabled);
        using var client = factory.CreateClient();
        var tokens = await LoginAsync(client, email);
        Authorize(client, tokens);
        // Merely opening Security must not generate a key or invalidate refresh tokens.
        var status = await client.GetFromJsonAsync<MfaStatusResponse>("api/v1/account/mfa");
        Assert.False(status!.Enabled);
        Assert.True(status.IsAvailable);
        (await client.PostAsJsonAsync("api/v1/account/refresh", new { tokens.RefreshToken })).EnsureSuccessStatusCode();
        var setup = await ManageAsync(client, new { resetSharedKey = true });
        Assert.False(setup.IsTwoFactorEnabled);
        Assert.NotEmpty(setup.SharedKey);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(ManagementPath,
            new { enable = true, twoFactorCode = "invalid" })).StatusCode);
        var enabled = await ManageAsync(client, new { enable = true, twoFactorCode = Code(setup.SharedKey), resetRecoveryCodes = true });
        Assert.True(enabled.IsTwoFactorEnabled);
        Assert.Equal(10, enabled.RecoveryCodes!.Length);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("api/v1/account/refresh", new { tokens.RefreshToken })).StatusCode);
        client.DefaultRequestHeaders.Authorization = null;
        var challenge = await client.PostAsJsonAsync(LoginPath, new { email, password = Password });
        Assert.Equal(HttpStatusCode.Unauthorized, challenge.StatusCode);
        var problem = await challenge.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("RequiresTwoFactor", problem.GetProperty("detail").GetString());
        Assert.False(problem.TryGetProperty("accessToken", out _));
        tokens = await LoginAsync(client, email, Code(setup.SharedKey));
        tokens = await LoginAsync(client, email, recoveryCode: enabled.RecoveryCodes[0]);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync(LoginPath,
            new { email, password = Password, twoFactorRecoveryCode = enabled.RecoveryCodes[0] })).StatusCode);
        Authorize(client, tokens);
        var regenerated = await ManageAsync(client, new { resetRecoveryCodes = true });
        Assert.Equal(10, regenerated.RecoveryCodesLeft);
        client.DefaultRequestHeaders.Authorization = null;
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync(LoginPath,
            new { email, password = Password, twoFactorRecoveryCode = enabled.RecoveryCodes[1] })).StatusCode);
        tokens = await LoginAsync(client, email, recoveryCode: regenerated.RecoveryCodes![0]);
        Authorize(client, tokens);
        var disabled = await ManageAsync(client, new { enable = false, forgetMachine = true });
        Assert.False(disabled.IsTwoFactorEnabled);
        client.DefaultRequestHeaders.Authorization = null;
        await LoginAsync(client, email);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task InvalidAuthenticatorCodes_TriggerAccountLockout(bool verificationEnabled)
    {
        await using var factory = CreateFactory(verificationEnabled);
        var email = await CreateUserAsync(factory, emailConfirmed: verificationEnabled);
        using var client = factory.CreateClient();
        Authorize(client, await LoginAsync(client, email));
        var setup = await ManageAsync(client, new { });
        await ManageAsync(client, new { enable = true, twoFactorCode = Code(setup.SharedKey) });
        client.DefaultRequestHeaders.Authorization = null;
        for (var attempt = 0; attempt < 3; attempt++)
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync(LoginPath,
                new { email, password = Password, twoFactorCode = "invalid" })).StatusCode);
        var locked = await client.PostAsJsonAsync(LoginPath, new { email, password = Password, twoFactorCode = Code(setup.SharedKey) });
        Assert.Equal(HttpStatusCode.Unauthorized, locked.StatusCode);
        Assert.Equal("LockedOut", (await locked.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("detail").GetString());
    }

    [Fact]
    public async Task DisabledEmailVerification_RetainsPasswordLockout()
    {
        await using var factory = CreateFactory(verificationEnabled: false);
        var email = await CreateUserAsync(factory, emailConfirmed: false);
        using var client = factory.CreateClient();
        await LoginAsync(client, email);
        for (var attempt = 0; attempt < 3; attempt++)
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync(LoginPath,
                new { email, password = "wrong" })).StatusCode);
        var locked = await client.PostAsJsonAsync(LoginPath, new { email, password = Password });
        Assert.Equal(HttpStatusCode.Unauthorized, locked.StatusCode);
        Assert.Equal("LockedOut", (await locked.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("detail").GetString());
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task PasswordReset_DoesNotBypassAuthenticatorMfa(bool verificationEnabled)
    {
        await using var factory = CreateFactory(verificationEnabled);
        var email = await CreateUserAsync(factory, emailConfirmed: verificationEnabled);
        using var client = factory.CreateClient();
        Authorize(client, await LoginAsync(client, email));
        var setup = await ManageAsync(client, new { resetSharedKey = true });
        await ManageAsync(client, new { enable = true, twoFactorCode = Code(setup.SharedKey) });
        const string newPassword = "NewStrongPassword2!";
        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            var user = (await users.FindByEmailAsync(email))!;
            var resetToken = await users.GeneratePasswordResetTokenAsync(user);
            Assert.True((await users.ResetPasswordAsync(user, resetToken, newPassword)).Succeeded);
        }
        client.DefaultRequestHeaders.Authorization = null;
        var challenge = await client.PostAsJsonAsync(LoginPath, new { email, password = newPassword });
        Assert.Equal(HttpStatusCode.Unauthorized, challenge.StatusCode);
        Assert.Equal("RequiresTwoFactor", (await challenge.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("detail").GetString());
        (await client.PostAsJsonAsync(LoginPath,
            new { email, password = newPassword, twoFactorCode = Code(setup.SharedKey) })).EnsureSuccessStatusCode();
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Management_RequiresAnAuthenticatedSession(bool verificationEnabled)
    {
        await using var factory = CreateFactory(verificationEnabled);
        using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync(ManagementPath, new { enable = false })).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("api/v1/account/mfa")).StatusCode);
    }

    private static WebApplicationFactory<Program> CreateFactory(bool verificationEnabled = true) =>
        new CustomWebApplicationFactory<Program>().WithWebHostBuilder(builder =>
            builder.UseSetting("Authentication:VerificationEnabled", verificationEnabled.ToString()));

    private static async Task<string> CreateUserAsync(WebApplicationFactory<Program> factory, bool emailConfirmed)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var email = $"mfa-{Guid.NewGuid():N}@example.com";
        Assert.True((await users.CreateAsync(new AppUser
        {
            Email = email,
            UserName = email,
            EmailConfirmed = emailConfirmed,
            LockoutEnabled = true
        }, Password)).Succeeded);
        return email;
    }

    private static async Task<AccessTokenResponse> LoginAsync(HttpClient client, string email,
        string? code = null, string? recoveryCode = null)
    {
        var response = await client.PostAsJsonAsync(LoginPath,
            new { email, password = Password, twoFactorCode = code, twoFactorRecoveryCode = recoveryCode });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<AccessTokenResponse>())!;
    }

    private static void Authorize(HttpClient client, AccessTokenResponse tokens) =>
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);

    private static async Task<TwoFactorResponse> ManageAsync(HttpClient client, object request)
    {
        var response = await client.PostAsJsonAsync(ManagementPath, request);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<TwoFactorResponse>())!;
    }

    // Independent RFC 6238 client implementation, using the secret returned by actual enrollment.
    private static string Code(string sharedKey)
    {
        const string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var bits = string.Concat(sharedKey.Select(character => Convert.ToString(alphabet.IndexOf(character), 2).PadLeft(5, '0')));
        var key = Enumerable.Range(0, bits.Length / 8).Select(index => Convert.ToByte(bits.Substring(index * 8, 8), 2)).ToArray();
        Span<byte> counter = stackalloc byte[8];
        BinaryPrimitives.WriteInt64BigEndian(counter, DateTimeOffset.UtcNow.ToUnixTimeSeconds() / 30);
        var hash = HMACSHA1.HashData(key, counter);
        var offset = hash[^1] & 0x0f;
        var number = BinaryPrimitives.ReadInt32BigEndian(hash.AsSpan(offset, 4)) & 0x7fffffff;
        return (number % 1_000_000).ToString("D6", CultureInfo.InvariantCulture);
    }
}
