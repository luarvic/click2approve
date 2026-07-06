using Click2Approve.Application.Models.Auxiliary;
using Click2Approve.Application.Services.Email;

namespace Click2Approve.Infrastructure.Services.Email;

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
