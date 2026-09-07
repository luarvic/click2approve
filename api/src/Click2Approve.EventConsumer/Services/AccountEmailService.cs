using System.Web;
using Click2Approve.Application.Abstractions.Email;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.Emails;
using Click2Approve.Application.Models.Events;

namespace Click2Approve.EventConsumer.Services;

/// <summary>Composes and sends account lifecycle emails.</summary>
public sealed class AccountEmailService(IEmailService emailService, IConfiguration configuration)
{
    private readonly IEmailService _emailService = emailService;
    private readonly IConfiguration _configuration = configuration;

    /// <summary>Composes and sends an account email request.</summary>
    public Task SendAsync(AccountEmailRequestedPayload payload, CancellationToken cancellationToken)
    {
        var type = payload.Type;
        // Also recognize queued confirmations produced before the separate email-change template existed.
        if (type == AccountEmailType.EmailConfirmation && IsEmailChange(payload.ConfirmationLink))
        {
            type = AccountEmailType.EmailChangeConfirmation;
        }
        var template = AccountEmailTemplates.Create(type, CreateCallbackUrl(payload, type), payload.TenantName, payload.IsNewUser);
        return _emailService.SendAsync(new EmailMessage
        {
            ToAddress = payload.ToAddress,
            Subject = template.Subject,
            Body = EmailLayout.Render(template, EmailBranding.GetLogoUrl(_configuration))
        }, cancellationToken);
    }

    private string CreateCallbackUrl(AccountEmailRequestedPayload payload, AccountEmailType type) => type switch
    {
        AccountEmailType.EmailConfirmation => UriHelpers.GetDerivedEmailConfirmationLink(
            new Uri(HttpUtility.HtmlDecode(GetRequiredConfirmationLink(payload))),
            _configuration.GetValue<Uri>("UI:BaseUrl"),
            _configuration["UI:AppPath"]).ToString(),
        // Identity's native callback carries changedEmail; the current UI confirmation page does not forward it.
        AccountEmailType.EmailChangeConfirmation => HttpUtility.HtmlDecode(GetRequiredConfirmationLink(payload)),
        AccountEmailType.PasswordReset when payload.ResetCode is not null => UriHelpers.GetDerivedPasswordResetLink(
            payload.ToAddress, payload.ResetCode,
            _configuration.GetValue<Uri>("UI:BaseUrl"), _configuration["UI:AppPath"]).ToString(),
        AccountEmailType.PasswordReset => HttpUtility.HtmlDecode(payload.ResetLink
            ?? throw new InvalidOperationException("Password reset requires a reset link or code.")),
        AccountEmailType.EmployeeInvitation => UriHelpers.GetUiUri(
            _configuration.GetValue<Uri>("UI:BaseUrl"), _configuration["UI:AppPath"],
            payload.IsNewUser ? "signUp" : "signIn").ToString(),
        _ => throw new InvalidOperationException($"Unsupported account email type '{type}'.")
    };

    private static bool IsEmailChange(string? link) =>
        Uri.TryCreate(HttpUtility.HtmlDecode(link), UriKind.Absolute, out var uri)
        && HttpUtility.ParseQueryString(uri.Query).Get("changedEmail") is not null;

    private static string GetRequiredConfirmationLink(AccountEmailRequestedPayload payload) =>
        payload.ConfirmationLink ?? throw new InvalidOperationException("Email confirmation requires a confirmation link.");
}
