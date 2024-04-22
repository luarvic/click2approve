using click2approve.WebAPI.Models;
using FluentEmail.Core;
using Hangfire;

namespace click2approve.WebAPI.Services;

public class EmailService(ILogger<EmailService> logger, IFluentEmailFactory fluentEmailFactory) : IEmailService
{
    private readonly ILogger<EmailService> _logger = logger;
    private readonly IFluentEmailFactory _fluentEmailFactory = fluentEmailFactory;

    public Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken)
    {
        var email = _fluentEmailFactory
            .Create()
            .To(emailMessage.ToAddress)
            .Subject(emailMessage.Subject)
            .Body(emailMessage.Body, isHtml: true);
        BackgroundJob.Enqueue(() => email.SendAsync(cancellationToken));
        return Task.FromResult(0);
    }
}
