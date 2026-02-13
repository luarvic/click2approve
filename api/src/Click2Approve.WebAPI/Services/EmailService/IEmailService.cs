using Click2Approve.WebAPI.Models;

namespace Click2Approve.WebAPI.Services.EmailService;

/// <summary>
/// Defines an interface for a services that manages email.
/// </summary>
public interface IEmailService
{
    Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken);
}

