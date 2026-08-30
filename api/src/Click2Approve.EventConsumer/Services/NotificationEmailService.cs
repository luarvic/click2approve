using Click2Approve.Application.Abstractions.Email;
using Click2Approve.Application.Extensions;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.Emails;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.EventConsumer.Services;

/// <summary>
/// Renders and sends notification email after applying the recipient's current preferences.
/// </summary>
public sealed class NotificationEmailService(
    ApiDbContext db,
    IEmailService emailService,
    IConfiguration configuration)
{
    private readonly ApiDbContext _db = db;
    private readonly IEmailService _emailService = emailService;
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Composes and sends an email notification for a selected recipient.
    /// </summary>
    public async Task SendAsync(AppUser recipient, NotificationEventPayload payload, CancellationToken cancellationToken)
    {
        var message = await CreateMessageAsync(recipient, payload, cancellationToken);
        if (message is not null) await _emailService.SendAsync(message, cancellationToken);
    }

    private async Task<EmailMessage?> CreateMessageAsync(
        AppUser recipient,
        NotificationEventPayload payload,
        CancellationToken cancellationToken) =>
        payload.Type switch
        {
            NotificationType.ApprovalRequestTaskCreated => await CreateTaskCreatedMessageAsync(recipient, payload, cancellationToken),
            NotificationType.ApprovalRequestTaskCompleted => await CreateRequestMessageAsync(
                recipient,
                payload,
                "ApprovalRequestCancelled",
                "tasks",
                cancellationToken),
            NotificationType.ApprovalRequestStepCompleted => await CreateRequestMessageAsync(
                recipient,
                payload,
                "ApprovalRequestReviewed",
                "requests",
                cancellationToken),
            NotificationType.ApprovalRequestCompleted => await CreateRequestMessageAsync(
                recipient,
                payload,
                "ApprovalRequestReviewed",
                "requests",
                cancellationToken),
            _ => null
        };

    private async Task<EmailMessage?> CreateTaskCreatedMessageAsync(
        AppUser recipient,
        NotificationEventPayload payload,
        CancellationToken cancellationToken)
    {
        var task = await _db.ApprovalRequestTasks
            .Include(item => item.ApprovalRequest)
                .ThenInclude(request => request.CreatedByUser)
            .Include(item => item.ApprovalRequest)
                .ThenInclude(request => request.RequestFiles)
                    .ThenInclude(file => file.UserFile)
            .FirstOrDefaultAsync(item => item.GlobalId == payload.EntityGlobalId, cancellationToken);
        return task is null ? null : CreateMessage(recipient, task.ApprovalRequest, "ApprovalRequestSent", "tasks");
    }

    private async Task<EmailMessage?> CreateRequestMessageAsync(
        AppUser recipient,
        NotificationEventPayload payload,
        string templateName,
        string route,
        CancellationToken cancellationToken)
    {
        var request = await _db.ApprovalRequests
            .Include(item => item.CreatedByUser)
            .Include(item => item.RequestFiles)
                .ThenInclude(file => file.UserFile)
            .FirstOrDefaultAsync(item => item.GlobalId == payload.EntityGlobalId, cancellationToken);
        return request is null ? null : CreateMessage(recipient, request, templateName, route);
    }

    private EmailMessage? CreateMessage(AppUser recipient, ApprovalRequest request, string templateName, string route)
    {
        var email = recipient.NormalizedEmail;
        if (string.IsNullOrWhiteSpace(email)) return null;

        var link = UriHelpers.GetUiUri(_configuration.GetValue<Uri>("UI:BaseUrl"), _configuration["UI:AppPath"], route).ToString();
        return new EmailMessage
        {
            ToAddress = email,
            Subject = _configuration[$"Email:Templates:{templateName}Subject"]!,
            Body = EmailHelpers.BuildHtmlEmail(
                _configuration[$"Email:Templates:{templateName}Heading"]!,
                string.Format(
                    _configuration[$"Email:Templates:{templateName}Message"]!,
                    request.CreatedByUser.NormalizedEmailOrEmpty(),
                    GetActiveFileNames(request)),
                link,
                _configuration[$"Email:Templates:{templateName}LinkText"]!)
        };
    }

    private static string GetActiveFileNames(ApprovalRequest request) => string.Join(", ", request.RequestFiles
        .Where(file => file.RevisionAction != ApprovalRequestFileRevisionAction.Removed)
        .OrderBy(file => file.Sequence)
        .Select(file => file.UserFile.Name));
}
