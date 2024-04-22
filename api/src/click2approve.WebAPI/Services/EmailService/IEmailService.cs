using click2approve.WebAPI.Models;

namespace click2approve.WebAPI.Services;

public interface IEmailService
{
    Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken);
}

