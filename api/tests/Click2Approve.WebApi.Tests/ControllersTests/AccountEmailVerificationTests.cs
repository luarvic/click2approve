using System.Net.Http.Json;
using System.Text.Json;
using Click2Approve.Application.Models.Events;
using Click2Approve.Infrastructure.Persistence;
using Click2Approve.WebApi.Tests.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Click2Approve.WebApi.Tests.ControllersTests;

/// <summary>
/// Verifies that the email verification policy controls confirmation delivery only.
/// </summary>
public class AccountEmailVerificationTests
{
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task RegistrationAndResend_QueueConfirmationOnlyWhenVerificationEnabled(bool verificationEnabled)
    {
        await using var factory = new CustomWebApplicationFactory<Program>().WithWebHostBuilder(
            builder => builder.UseSetting("Authentication:VerificationEnabled", verificationEnabled.ToString()));
        var client = factory.CreateClient();
        var email = $"verification-{Guid.NewGuid()}@example.com";

        (await client.PostAsJsonAsync("api/v1/account/register",
            new Credentials { Email = email, Password = "ZAQ12wsx!" })).EnsureSuccessStatusCode();

        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        var registrationEmails = await ReadAccountEmailsAsync(db, email);
        Assert.Equal(verificationEnabled ? 1 : 0, registrationEmails.Count);

        (await client.PostAsJsonAsync("api/v1/account/resendConfirmationEmail", new { email }))
            .EnsureSuccessStatusCode();

        var emails = await ReadAccountEmailsAsync(db, email);
        Assert.Equal(verificationEnabled ? 2 : 0, emails.Count);
        Assert.All(emails, payload =>
        {
            Assert.Equal(AccountEmailType.EmailConfirmation, payload.Type);
            Assert.False(string.IsNullOrWhiteSpace(payload.ConfirmationLink));
        });
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task ForgotPassword_QueuesResetRegardlessOfVerificationSetting(bool verificationEnabled)
    {
        await using var factory = new CustomWebApplicationFactory<Program>().WithWebHostBuilder(
            builder => builder.UseSetting("Authentication:VerificationEnabled", verificationEnabled.ToString()));
        var client = factory.CreateClient();
        var email = $"password-reset-{Guid.NewGuid()}@example.com";

        (await client.PostAsJsonAsync("api/v1/account/register",
            new Credentials { Email = email, Password = "ZAQ12wsx!" })).EnsureSuccessStatusCode();

        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        var user = await db.Users.SingleAsync(user => user.Email == email);
        user.EmailConfirmed = true;
        await db.SaveChangesAsync();

        (await client.PostAsJsonAsync("api/v1/account/forgotPassword", new { email })).EnsureSuccessStatusCode();

        var emails = await ReadAccountEmailsAsync(db, email);
        var reset = Assert.Single(emails, payload => payload.Type == AccountEmailType.PasswordReset);
        Assert.False(string.IsNullOrWhiteSpace(reset.ResetCode));
    }

    private static async Task<List<AccountEmailRequestedPayload>> ReadAccountEmailsAsync(ApiDbContext db, string email)
    {
        var messages = await db.EventOutboxMessages.AsNoTracking()
            .Where(message => message.EventType == EventTypes.AccountEmailRequestedV1)
            .Select(message => message.Payload)
            .ToListAsync();

        return [.. messages
            .Select(message => JsonSerializer.Deserialize<AccountEmailRequestedPayload>(message, EventJson.Options)!)
            .Where(payload => payload.ToAddress == email)];
    }
}
