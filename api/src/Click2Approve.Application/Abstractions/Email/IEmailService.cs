using Click2Approve.Application.Models.Emails;
using Click2Approve.Application.Models.Files;
using Click2Approve.Application.Models.Notifications;

namespace Click2Approve.Application.Abstractions.Email;

/// <summary>
/// Defines an interface for a services that manages email.
/// </summary>
public interface IEmailService
{
    Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken);
}

