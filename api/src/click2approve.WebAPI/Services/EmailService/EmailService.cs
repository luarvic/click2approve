using click2approve.WebAPI.Models;
using FluentEmail.Core;
using Hangfire;

namespace click2approve.WebAPI.Services;

/// <summary>
/// Implements a services that manages email.
/// </summary>
public class EmailService(ILogger<EmailService> logger, IFluentEmailFactory fluentEmailFactory) : IEmailService
{
    private readonly ILogger<EmailService> _logger = logger;
    private readonly IFluentEmailFactory _fluentEmailFactory = fluentEmailFactory;

    /// <summary>
    /// Sends an email message with a Hangfire background job.
    /// </summary>
    public Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken)
    {
        BackgroundJob.Enqueue(() => CreateAndSendAsync(emailMessage, cancellationToken));
        return Task.FromResult(0);
    }

    /// <summary>
    /// Creates and sends an email massage.
    /// </summary>
    public async Task CreateAndSendAsync(EmailMessage emailMessage, CancellationToken cancellationToken)
    {
        await _fluentEmailFactory
            .Create()
            .To(emailMessage.ToAddress)
            .Subject(emailMessage.Subject)
            .Body(emailMessage.Body, isHtml: true)
            .SendAsync(cancellationToken);
    }
}
