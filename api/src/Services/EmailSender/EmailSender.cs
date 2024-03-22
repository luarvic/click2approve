using api.Models;
using Microsoft.AspNetCore.Identity;

namespace api.Services;

public class EmailSender(IEmailService emailService) : IEmailSender<AppUser>
{
    private readonly IEmailService _emailService = emailService;

    public async Task SendConfirmationLinkAsync(AppUser user, string email, string confirmationLink)
    {
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = "Confirm your email address to get started on click2approve",
            Body = confirmationLink
        };
        await _emailService.Send(emailMessage);
    }

    public async Task SendPasswordResetCodeAsync(AppUser user, string email, string resetCode)
    {
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = "Reset your password on click2approve",
            Body = resetCode
        };
        await _emailService.Send(emailMessage);
    }

    public async Task SendPasswordResetLinkAsync(AppUser user, string email, string resetLink)
    {
        var emailMessage = new EmailMessage
        {
            ToAddress = email,
            Subject = "Reset your password on click2approve",
            Body = resetLink
        };
        await _emailService.Send(emailMessage);
    }
}
