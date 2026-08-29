using System.Web;
using Click2Approve.Application.Abstractions.Email;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.Emails;
using Click2Approve.Application.Models.Events;

namespace Click2Approve.EventDispatcher.Services;

/// <summary>
/// Composes and sends account lifecycle emails.
/// </summary>
public sealed class AccountEmailService(IEmailService emailService, IConfiguration configuration)
{
    private readonly IEmailService _emailService = emailService;
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Composes and sends an account email request.
    /// </summary>
    public Task SendAsync(AccountEmailRequestedPayload payload, CancellationToken cancellationToken) =>
        _emailService.SendAsync(CreateMessage(payload), cancellationToken);

    private EmailMessage CreateMessage(AccountEmailRequestedPayload payload) => payload.Type switch
    {
        AccountEmailType.EmailConfirmation => CreateIdentityMessage(payload, "IdentityConfirmation"),
        AccountEmailType.PasswordReset => CreateIdentityMessage(payload, "IdentityReset"),
        AccountEmailType.EmployeeInvitation => CreateEmployeeInvitationMessage(payload),
        _ => throw new InvalidOperationException($"Unsupported account email type '{payload.Type}'.")
    };

    private EmailMessage CreateIdentityMessage(AccountEmailRequestedPayload payload, string templateName) => new()
    {
        ToAddress = payload.ToAddress,
        Subject = _configuration[$"Email:Templates:{templateName}Subject"]!,
        Body = EmailHelpers.BuildHtmlEmail(
            _configuration[$"Email:Templates:{templateName}Heading"]!,
            _configuration[$"Email:Templates:{templateName}Message"]!,
            CreateCallbackUrl(payload),
            _configuration[$"Email:Templates:{templateName}LinkText"]!)
    };

    private EmailMessage CreateEmployeeInvitationMessage(AccountEmailRequestedPayload payload)
    {
        var linkText = _configuration[
            payload.IsNewUser
                ? "Email:Templates:EmployeeInvitationSignUpLinkText"
                : "Email:Templates:EmployeeInvitationSignInLinkText"]
            ?? (payload.IsNewUser ? "Sign up" : "Sign in");
        return new EmailMessage
        {
            ToAddress = payload.ToAddress,
            Subject = _configuration["Email:Templates:EmployeeInvitationSubject"] ?? "You have been invited to Click2Approve",
            Body = EmailHelpers.BuildHtmlEmail(
                _configuration["Email:Templates:EmployeeInvitationHeading"] ?? "Hi there,",
                string.Format(
                    _configuration["Email:Templates:EmployeeInvitationMessage"]
                    ?? "You have been invited to join {0}.",
                    payload.TenantName),
                UriHelpers.GetUiUri(
                    _configuration.GetValue<Uri>("UI:BaseUrl"),
                    _configuration["UI:AppPath"],
                    payload.IsNewUser ? "signUp" : "signIn").ToString(),
                linkText)
        };
    }

    private string CreateCallbackUrl(AccountEmailRequestedPayload payload) => payload.Type switch
    {
        AccountEmailType.EmailConfirmation => UriHelpers.GetDerivedEmailConfirmationLink(
            new Uri(HttpUtility.HtmlDecode(GetRequiredConfirmationLink(payload))),
            _configuration.GetValue<Uri>("UI:BaseUrl"),
            _configuration["UI:AppPath"]).ToString(),
        AccountEmailType.PasswordReset when payload.ResetCode is not null => UriHelpers.GetDerivedPasswordResetLink(
            payload.ToAddress,
            payload.ResetCode,
            _configuration.GetValue<Uri>("UI:BaseUrl"),
            _configuration["UI:AppPath"]).ToString(),
        AccountEmailType.PasswordReset => GetRequiredResetLink(payload),
        _ => throw new InvalidOperationException($"Unsupported account email type '{payload.Type}'.")
    };

    private static string GetRequiredConfirmationLink(AccountEmailRequestedPayload payload) =>
        payload.ConfirmationLink ?? throw new InvalidOperationException("Email confirmation requires a confirmation link.");

    private static string GetRequiredResetLink(AccountEmailRequestedPayload payload) =>
        payload.ResetLink ?? throw new InvalidOperationException("Password reset requires a reset link or code.");
}
