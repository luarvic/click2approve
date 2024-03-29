using api.Models;

namespace api.Services;

public interface IEmailService
{
    Task SendAsync(EmailMessage emailMessage);
}

