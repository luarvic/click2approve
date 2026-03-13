using Azure;
using Azure.Communication.Email;
using Hangfire;
using EmailMessage = Click2Approve.WebApi.Models.Auxiliary.EmailMessage;

namespace Click2Approve.WebApi.Services.EmailService;

/// <summary>
/// Represents an implementation of the IEmailService interface that uses Azure's email communication services to send emails.
/// </summary>
public class AzureEmailCommunicationService(EmailClient emailClient, IConfiguration configuration)
    : IEmailService
{
    private readonly EmailClient _emailClient = emailClient;
    private readonly IConfiguration _configuration = configuration;

    public Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken)
    {
        BackgroundJob.Enqueue(() => EmailAsync(emailMessage, cancellationToken));
        return Task.FromResult(0);
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
