using System.Net;
using System.Text.Json;
using Click2Approve.Application.Abstractions.Email;
using Click2Approve.Application.Models.Emails;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;
using Click2Approve.EventConsumer.Services;
using Microsoft.Extensions.Configuration;

namespace Click2Approve.EventWorkers.Tests.Services;

/// <summary>Verifies that branded account emails preserve Identity callback data.</summary>
public sealed class AccountEmailServiceTests
{
    [Theory]
    [InlineData(AccountEmailType.EmailConfirmation, "https://api.example.com/confirmEmail?userId=abc&code=a%2Bb", "https://ui.example.com/app/confirmEmail?userId=abc&code=a%2Bb", "Confirm your Click2Approve email")]
    [InlineData(AccountEmailType.EmailConfirmation, "https://api.example.com/confirmEmail?userId=abc&amp;code=a%2Bb&amp;changedEmail=new%40example.com", "https://api.example.com/confirmEmail?userId=abc&code=a%2Bb&changedEmail=new%40example.com", "Confirm your new Click2Approve email")]
    [InlineData(AccountEmailType.EmailChangeConfirmation, "https://api.example.com/confirmEmail?userId=abc&code=a%2Bb&changedEmail=new%40example.com", "https://api.example.com/confirmEmail?userId=abc&code=a%2Bb&changedEmail=new%40example.com", "Confirm your new Click2Approve email")]
    public async Task Confirmation_PreservesTokenAndEmailChangeParameters(
        AccountEmailType type, string callback, string expectedUrl, string subject)
    {
        var sender = new RecordingEmailService();
        var service = new AccountEmailService(sender, Configuration());
        await service.SendAsync(new AccountEmailRequestedPayload(type, "new@example.com", ConfirmationLink: callback), CancellationToken.None);
        var email = Assert.Single(sender.Messages);
        Assert.Equal("new@example.com", email.ToAddress);
        Assert.Equal(subject, email.Subject);
        Assert.Contains($"href=\"{expectedUrl}\"", WebUtility.HtmlDecode(email.Body));
    }

    [Fact]
    public async Task ResetCodeAndResetLink_ArePreserved()
    {
        var sender = new RecordingEmailService();
        var service = new AccountEmailService(sender, Configuration());
        await service.SendAsync(new AccountEmailRequestedPayload(AccountEmailType.PasswordReset, "person@example.com", ResetCode: "a+b/="), CancellationToken.None);
        await service.SendAsync(new AccountEmailRequestedPayload(AccountEmailType.PasswordReset, "person@example.com",
            ResetLink: "https://api.example.com/reset?code=a%2Bb&amp;email=person%40example.com"), CancellationToken.None);
        Assert.Contains("code=a%2Bb%2F%3D", WebUtility.HtmlDecode(sender.Messages[0].Body));
        Assert.Contains("https://api.example.com/reset?code=a%2Bb&email=person%40example.com", WebUtility.HtmlDecode(sender.Messages[1].Body));
    }

    [Fact]
    public void NotificationPayload_RemainsCompatibleWithOldQueuedEvents()
    {
        var payload = new NotificationEventPayload(NotificationType.ApprovalRequestStepCompleted, 1, Guid.NewGuid(), "Contract", 2);
        var json = JsonSerializer.Serialize(payload, EventJson.Options);
        var oldJson = json.Replace(",\"sourceGlobalId\":null", string.Empty);
        Assert.Null(JsonSerializer.Deserialize<NotificationEventPayload>(oldJson, EventJson.Options)!.SourceGlobalId);
        var sourceId = Guid.NewGuid();
        var newJson = JsonSerializer.Serialize(payload with { SourceGlobalId = sourceId }, EventJson.Options);
        Assert.Equal(sourceId, JsonSerializer.Deserialize<NotificationEventPayload>(newJson, EventJson.Options)!.SourceGlobalId);
    }

    private static IConfiguration Configuration() => new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
    {
        ["UI:BaseUrl"] = "https://ui.example.com",
        ["UI:AppPath"] = "/app"
    }).Build();

    private sealed class RecordingEmailService : IEmailService
    {
        public List<EmailMessage> Messages { get; } = [];
        public Task SendAsync(EmailMessage message, CancellationToken cancellationToken)
        {
            Messages.Add(message);
            return Task.CompletedTask;
        }
    }
}
