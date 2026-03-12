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
        var confirmationHeading = _configuration["Email:Templates:IdentityConfirmationHeading"]!;
        var confirmationMessageTemplate = _configuration["Email:Templates:IdentityConfirmationMessage"]!;
        var confirmationLinkText = _configuration["Email:Templates:IdentityConfirmationLinkText"]!;
        var confirmationSubject = _configuration["Email:Templates:IdentityConfirmationSubject"]!;
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = confirmationSubject,
            Body = BuildHtmlEmail(
                confirmationHeading,
                string.Format(confirmationMessageTemplate),
                derivedConfirmationLink,
                confirmationLinkText
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
        var resetHeading = _configuration["Email:Templates:IdentityResetHeading"]!;
        var resetMessageTemplate = _configuration["Email:Templates:IdentityResetMessage"]!;
        var resetLinkText = _configuration["Email:Templates:IdentityResetLinkText"]!;
        var resetSubject = _configuration["Email:Templates:IdentityResetSubject"]!;
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = resetSubject,
            Body = BuildHtmlEmail(
                resetHeading,
                string.Format(resetMessageTemplate),
                derivedResetLink,
                resetLinkText
            )
        };
        await _emailService.SendAsync(emailMessage, CancellationToken.None);
    }

    /// <summary>
    /// Sends a password reset link.
    /// </summary>
    public async Task SendPasswordResetLinkAsync(AppUser user, string email, string resetLink)
    {
        var resetHeading = _configuration["Email:Templates:IdentityResetHeading"]!;
        var resetMessageTemplate = _configuration["Email:Templates:IdentityResetMessage"]!;
        var resetLinkText = _configuration["Email:Templates:IdentityResetLinkText"]!;
        var resetSubject = _configuration["Email:Templates:IdentityResetSubject"]!;
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = resetSubject,
            Body = BuildHtmlEmail(
                resetHeading,
                string.Format(resetMessageTemplate),
                resetLink,
                resetLinkText
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
            $"<p style=\"margin: 0 0 1em;\">{heading}</p>",
            $"<p style=\"margin: 0 0 1em;\">{message}</p>",
            $"<p style=\"margin: 0 0 1em;\"><a href=\"{link}\">{linkText}</a></p>",
            "<p style=\"margin: 0 0 1em;\">Thanks,</p>",
            "<p style=\"margin: 0 0 1em;\">The click2approve team</p>",
            "</div>"
        );
    }
}
