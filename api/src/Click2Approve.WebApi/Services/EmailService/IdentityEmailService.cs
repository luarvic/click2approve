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
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = "Confirm your email to get started with click2approve",
            Body = UriHelpers.GetDerivedEmailConfirmationLink(
                new Uri(confirmationLinkPlainText), _configuration.GetValue<Uri>("UI:BaseUrl")
            ).ToString()
        };
        await _emailService.SendAsync(emailMessage, CancellationToken.None);
    }

    /// <summary>
    /// Sends a password reset code.
    /// </summary>
    public async Task SendPasswordResetCodeAsync(AppUser user, string email, string resetCode)
    {
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = "Your click2approve password reset link",
            Body = UriHelpers.GetDerivedPasswordResetLink(
                user.Email!.ToLower(), resetCode, _configuration.GetValue<Uri>("UI:BaseUrl")
            ).ToString()
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
            Body = resetLink
        };
        await _emailService.SendAsync(emailMessage, CancellationToken.None);
    }
}
