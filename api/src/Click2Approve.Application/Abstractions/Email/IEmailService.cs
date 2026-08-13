using Click2Approve.Application.Models.Auxiliary.Emails;
using Click2Approve.Application.Models.Auxiliary.Files;
using Click2Approve.Application.Models.Auxiliary.Notifications;

namespace Click2Approve.Application.Abstractions.Email;

/// <summary>
/// Defines an interface for a services that manages email.
/// </summary>
public interface IEmailService
{
    Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken);
}

