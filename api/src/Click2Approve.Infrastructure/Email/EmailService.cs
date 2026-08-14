using Click2Approve.Application.Abstractions.Email;
using Click2Approve.Application.Models.Emails;
using FluentEmail.Core;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;

namespace Click2Approve.Infrastructure.Email;

/// <summary>
/// Implements a services that manages email.
/// </summary>
public class EmailService(
    IBackgroundJobClient backgroundJobClient,
    IConfiguration configuration,
    ILogger<EmailService> logger,
    IFluentEmailFactory fluentEmailFactory) : IEmailService
{
    private readonly IBackgroundJobClient _backgroundJobClient = backgroundJobClient;
    private readonly string _emailQueue = configuration["Hangfire:Queues:Email:Name"]
        ?? throw new InvalidOperationException("The Hangfire email queue is required.");
    private readonly ILogger<EmailService> _logger = logger;
    private readonly IFluentEmailFactory _fluentEmailFactory = fluentEmailFactory;

    /// <summary>
    /// Sends an email message with a Hangfire background job.
    /// </summary>
    public Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken)
    {
        _backgroundJobClient.Create(
            Job.FromExpression(() => CreateAndSendAsync(emailMessage, cancellationToken)),
            new EnqueuedState(_emailQueue));
        return Task.CompletedTask;
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
