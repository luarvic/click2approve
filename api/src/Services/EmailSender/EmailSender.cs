using System.Web;
using api.Helpers;
using api.Models;
using Microsoft.AspNetCore.Identity;

namespace api.Services;

public class EmailSender(IEmailService emailService, IConfiguration configuration) : IEmailSender<AppUser>
{
    private readonly IEmailService _emailService = emailService;
    private readonly IConfiguration _configuration = configuration;

    public async Task SendConfirmationLinkAsync(AppUser user, string email, string confirmationLink)
    {
        var confirmationLinkPlainText = HttpUtility.HtmlDecode(confirmationLink);
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = "Confirm your email address to get started on click2approve",
            Body = UriHelpers.GetDerivedEmailConfirmationLink(
                new Uri(confirmationLinkPlainText), _configuration.GetValue<Uri>("UI:BaseUrl")
            ).ToString()
        };
        await _emailService.SendAsync(emailMessage);
    }

    public async Task SendPasswordResetCodeAsync(AppUser user, string email, string resetCode)
    {
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = "Reset your password on click2approve",
            Body = UriHelpers.GetDerivedPasswordResetLink(
                user.Email!.ToLower(), resetCode, _configuration.GetValue<Uri>("UI:BaseUrl")
            ).ToString()
        };
        await _emailService.SendAsync(emailMessage);
    }

    public async Task SendPasswordResetLinkAsync(AppUser user, string email, string resetLink)
    {
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = "Reset your password on click2approve",
            Body = resetLink
        };
        await _emailService.SendAsync(emailMessage);
    }
}
