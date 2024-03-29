using api.Models;

namespace api.Services;

public class EmailServiceStub() : IEmailService
{
    public Task SendAsync(EmailMessage emailMessage)
    {
        return Task.FromResult(0);
    }
}
