using Click2Approve.Application.Abstractions.Email;
using Click2Approve.Application.Models.Emails;
using FluentEmail.Core;

namespace Click2Approve.Infrastructure.Email;

/// <summary>
/// Implements a services that manages email.
/// </summary>
public class EmailService(
    IFluentEmailFactory fluentEmailFactory) : IEmailService
{
    private readonly IFluentEmailFactory _fluentEmailFactory = fluentEmailFactory;

    /// <summary>
    /// Sends an email message immediately.
    /// </summary>
    public Task SendAsync(EmailMessage emailMessage, CancellationToken cancellationToken) =>
        _fluentEmailFactory
            .Create()
            .To(emailMessage.ToAddress)
            .Subject(emailMessage.Subject)
            .Body(emailMessage.Body, isHtml: true)
            .SendAsync(cancellationToken);
}
