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
                derivedConfirmationLink,
                "Confirm Email"
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
                derivedResetLink,
                "Reset Password"
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
                resetLink,
                "Reset Password"
            )
        };
        await _emailService.SendAsync(emailMessage, CancellationToken.None);
    }

    /// <summary>
    /// Builds an HTML email body with the given heading, message and link.
    /// </summary>
    private static string BuildHtmlEmail(string heading, string message, string link, string linkText)
    {
        return string.Join(
            Environment.NewLine,
            "<div style=\"font-family: Arial, sans-serif; font-size: 14px;\">",
            $"<p style=\"margin: 0 0 12px;\">{heading}</p>",
            $"<p style=\"margin: 0 0 12px;\">{message}</p>",
            $"<p style=\"margin: 0 0 12px;\"><a href=\"{link}\">{linkText}</a></p>",
            "<p style=\"margin: 0 0 6px;\">Thanks,</p>",
            "<p>The click2approve team</p>",
            "</div>"
        );
    }
}
