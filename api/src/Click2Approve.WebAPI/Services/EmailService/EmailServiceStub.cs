using Click2Approve.WebAPI.Models;

namespace Click2Approve.WebAPI.Services.EmailService;

/// <summary>
/// Implements a service that manages email.
/// </summary>
public class EmailServiceStub() : IEmailService
{
    /// <summary>
    /// Mocks the method for integration testing.
    /// </summary>
    public Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken)
    {
        return Task.FromResult(0);
    }
}
