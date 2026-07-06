using Click2Approve.Application.Models.Auxiliary;

namespace Click2Approve.Application.Services.Email;

/// <summary>
/// Defines an interface for a services that manages email.
/// </summary>
public interface IEmailService
{
    Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken);
}

