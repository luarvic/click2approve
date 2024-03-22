using api.Models;

namespace api.Services;

public interface IEmailService
{
    Task Send(EmailMessage emailMessage);
}

