using System.Web;
using Click2Approve.WebApi.Helpers;
using Click2Approve.WebApi.Models;
using Click2Approve.WebApi.Models.Auxiliary;
using Microsoft.AspNetCore.Identity;

namespace Click2Approve.WebApi.Services.EmailService;

/// <summary>
/// Implements IEmailSender interface of Identity framework.
/// </summary>
public class IdentityEmailService(IEmailService emailService, IConfiguration configuration) : IEmailSender<AppUser>
{
    private readonly IEmailService _emailService = emailService;
    private readonly IConfiguration _configuration = configuration;

    private static string BuildHtmlEmail(string heading, string message, string link)
    {
        return string.Join(
            Environment.NewLine,
            "<div style=\"font-family: Arial, sans-serif; font-size: 14px; color: #1f2933;\">",
            $"<p style=\"margin: 0 0 12px;\">{heading}</p>",
            $"<p style=\"margin: 0 0 12px;\">{message}</p>",
            $"<p style=\"margin: 0 0 12px;\"><a href=\"{link}\" style=\"color: #1a73e8;\">Open link</a></p>",
            "<p style=\"margin: 0 0 12px;\">If the button does not work, copy and paste this URL into your browser:</p>",
            $"<p style=\"margin: 0 0 12px; word-break: break-all;\">{link}</p>",
            "<p style=\"margin: 16px 0 0; color: #52616b;\">If you did not request this, you can ignore this email.</p>",
            "<p style=\"margin: 16px 0 0; color: #52616b;\">click2approve</p>",
            "</div>"
        );
    }

    /// <summary>
    /// Sends an email confirmation link.
    /// </summary>
    public async Task SendConfirmationLinkAsync(AppUser user, string email, string confirmationLink)
    {
        var confirmationLinkPlainText = HttpUtility.HtmlDecode(confirmationLink);
        var derivedConfirmationLink = UriHelpers.GetDerivedEmailConfirmationLink(
            new Uri(confirmationLinkPlainText), _configuration.GetValue<Uri>("UI:BaseUrl")
        ).ToString();
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = "Confirm your email for click2approve",
            Body = BuildHtmlEmail(
                "Hi there,",
                "Thanks for creating a click2approve account. Please confirm your email address using the link below.",
                derivedConfirmationLink
            )
        };
        await _emailService.SendAsync(emailMessage, CancellationToken.None);
    }

    /// <summary>
    /// Sends a password reset code.
    /// </summary>
    public async Task SendPasswordResetCodeAsync(AppUser user, string email, string resetCode)
    {
        var derivedResetLink = UriHelpers.GetDerivedPasswordResetLink(
            user.Email!.ToLower(), resetCode, _configuration.GetValue<Uri>("UI:BaseUrl")
        ).ToString();
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = "Reset your click2approve password",
            Body = BuildHtmlEmail(
                "Hi there,",
                "We received a request to reset your click2approve password. Use the link below.",
                derivedResetLink
            )
        };
        await _emailService.SendAsync(emailMessage, CancellationToken.None);
    }

    /// <summary>
    /// Sends a password reset link.
    /// </summary>
    public async Task SendPasswordResetLinkAsync(AppUser user, string email, string resetLink)
    {
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = "Reset your click2approve password",
            Body = BuildHtmlEmail(
                "Hi there,",
                "We received a request to reset your click2approve password. Use the link below.",
                resetLink
            )
        };
        await _emailService.SendAsync(emailMessage, CancellationToken.None);
    }
}
