using Azure;
using Azure.Communication.Email;
using Click2Approve.Application.Abstractions.Email;
using EmailMessage = Click2Approve.Application.Models.Emails.EmailMessage;

namespace Click2Approve.Infrastructure.Email;

/// <summary>
/// Represents an implementation of the IEmailService interface that uses Azure's email communication services to send emails.
/// </summary>
public class AzureEmailCommunicationService(
    EmailClient emailClient,
    IConfiguration configuration)
    : IEmailService
{
    private readonly EmailClient _emailClient = emailClient;
    private readonly IConfiguration _configuration = configuration;

    public async Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken)
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
