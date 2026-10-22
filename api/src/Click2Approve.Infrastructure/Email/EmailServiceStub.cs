using Click2Approve.Application.Abstractions.Email;
using Click2Approve.Application.Models.Emails;

namespace Click2Approve.Infrastructure.Email;

/// <summary>
/// Implements a service that manages email.
/// </summary>
public class EmailServiceStub(ILogger<EmailServiceStub> logger) : IEmailService
{
    private readonly ILogger<EmailServiceStub> _logger = logger;

    /// <summary>
    /// Mocks the method for integration testing.
    /// </summary>
    public Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken)
    {
        _logger.LogDebug("EmailServiceStub.SendAsync called with: {EmailMessageBody}", emailMessage.Body);
        return Task.FromResult(0);
    }
}
