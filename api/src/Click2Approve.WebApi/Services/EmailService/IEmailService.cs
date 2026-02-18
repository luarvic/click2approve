using Click2Approve.WebApi.Models.Auxiliary;

namespace Click2Approve.WebApi.Services.EmailService;

/// <summary>
/// Defines an interface for a services that manages email.
/// </summary>
public interface IEmailService
{
    Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken);
}

