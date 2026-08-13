using Azure;
using Azure.Communication.Email;
using Click2Approve.Application.Abstractions.Email;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using EmailMessage = Click2Approve.Application.Models.Auxiliary.Emails.EmailMessage;

namespace Click2Approve.Infrastructure.Email;

/// <summary>
/// Represents an implementation of the IEmailService interface that uses Azure's email communication services to send emails.
/// </summary>
public class AzureEmailCommunicationService(
    IBackgroundJobClient backgroundJobClient,
    EmailClient emailClient,
    IConfiguration configuration)
    : IEmailService
{
    private readonly IBackgroundJobClient _backgroundJobClient = backgroundJobClient;
    private readonly EmailClient _emailClient = emailClient;
    private readonly IConfiguration _configuration = configuration;
    private readonly string _emailQueue = configuration["Hangfire:Queues:Email:Name"]
        ?? throw new InvalidOperationException("The Hangfire email queue is required.");

    public Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken)
    {
        _backgroundJobClient.Create(
            Job.FromExpression(() => EmailAsync(emailMessage, cancellationToken)),
            new EnqueuedState(_emailQueue));
        return Task.CompletedTask;
    }

    public async Task EmailAsync(EmailMessage emailMessage, CancellationToken cancellationToken)
    {
        await _emailClient.SendAsync(
            WaitUntil.Started,
            senderAddress: _configuration.GetValue<string>("Email:FromEmailAddress"),
            recipientAddress: emailMessage.ToAddress,
            subject: emailMessage.Subject,
            htmlContent: emailMessage.Body,
            cancellationToken: cancellationToken);
    }
}
