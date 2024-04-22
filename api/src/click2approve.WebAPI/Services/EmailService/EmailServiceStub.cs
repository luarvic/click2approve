using click2approve.WebAPI.Models;

namespace click2approve.WebAPI.Services;

public class EmailServiceStub() : IEmailService
{
    public Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken)
    {
        return Task.FromResult(0);
    }
}
