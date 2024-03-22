using api.Models;
using FluentEmail.Core;

namespace api.Services;

public class EmailService(ILogger<EmailService> logger, IFluentEmailFactory fluentEmailFactory) : IEmailService
{
    private readonly ILogger<EmailService> _logger = logger;
    private readonly IFluentEmailFactory _fluentEmailFactory = fluentEmailFactory;

    public async Task Send(EmailMessage emailMessage)
    {
        await _fluentEmailFactory.Create().To(emailMessage.ToAddress)
            .Subject(emailMessage.Subject)
            .Body(emailMessage.Body, isHtml: true)
            .SendAsync();
    }
}
