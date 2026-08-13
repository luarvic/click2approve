using Click2Approve.Application.Abstractions.Email;
using Click2Approve.Application.Abstractions.Services.Notifications;
using Click2Approve.Application.Extensions;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.Auxiliary.Emails;
using Click2Approve.Application.Models.Auxiliary.Files;
using Click2Approve.Application.Models.Auxiliary.Notifications;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Notifications;

/// <summary>
/// Dispatches pending email event deliveries on the configured Hangfire schedule.
/// </summary>
public class NotificationEmailDispatchJob(
    ApiDbContext db,
    IEmailService emailService,
    IUserNotificationPreferenceService notificationPreferenceService,
    IConfiguration configuration)
{
    private readonly ApiDbContext _db = db;
    private readonly IEmailService _emailService = emailService;
    private readonly IUserNotificationPreferenceService _notificationPreferenceService = notificationPreferenceService;
    private readonly IConfiguration _configuration = configuration;

    public async Task DispatchAsync()
    {
        var batchSize = Math.Clamp(
            _configuration.GetValue<int>("Notifications:Channels:Email:Dispatch:BatchSize"),
            _configuration.GetValue<int>("Notifications:Channels:Email:Dispatch:MinimumBatchSize"),
            _configuration.GetValue<int>("Notifications:Channels:Email:Dispatch:MaximumBatchSize"));
        var lastErrorMaximumLength = _configuration.GetValue<int>("Notifications:EventDeliveries:LastErrorMaximumLength");
        var deliveries = await _db.EventDeliveries
            .Include(delivery => delivery.DomainEvent)
            .Include(delivery => delivery.User)
            .Where(delivery => delivery.Channel == EventDeliveryChannel.Email && delivery.SentAt == null)
            .OrderBy(delivery => delivery.QueuedAt)
            .ThenBy(delivery => delivery.Id)
            .Take(batchSize)
            .ToListAsync();

        foreach (var delivery in deliveries)
        {
            try
            {
                if (!await IsEmailEnabledAsync(delivery))
                {
                    delivery.SentAt = DateTime.UtcNow;
                    continue;
                }

                var message = await CreateMessageAsync(delivery);
                if (message is not null)
                {
                    await _emailService.SendAsync(message, CancellationToken.None);
                }

                delivery.SentAt = DateTime.UtcNow;
                delivery.LastError = null;
            }
            catch (Exception exception)
            {
                delivery.AttemptCount++;
                delivery.LastError = exception.Message[..Math.Min(exception.Message.Length, lastErrorMaximumLength)];
            }
        }

        await _db.SaveChangesAsync();
    }

    private async Task<EmailMessage?> CreateMessageAsync(EventDelivery delivery)
    {
        return delivery.DomainEvent.Type switch
        {
            DomainEventType.ApprovalRequestTaskCreated => await CreateTaskCreatedMessageAsync(delivery),
            DomainEventType.ApprovalRequestCancelled => await CreateRequestMessageAsync(delivery, "ApprovalRequestCancelled", "inbox"),
            DomainEventType.ApprovalRequestReviewed => await CreateRequestMessageAsync(delivery, "ApprovalRequestReviewed", "sent"),
            _ => null
        };
    }

    private Task<bool> IsEmailEnabledAsync(EventDelivery delivery)
    {
        var notificationType = delivery.DomainEvent.Type switch
        {
            DomainEventType.ApprovalRequestTaskCreated => NotificationType.ApprovalRequestTaskCreated,
            DomainEventType.ApprovalRequestCancelled => NotificationType.ApprovalRequestCancelled,
            DomainEventType.ApprovalRequestReviewed => NotificationType.ApprovalRequestReviewed,
            _ => (NotificationType?)null
        };
        return notificationType.HasValue
            ? _notificationPreferenceService.IsEnabledAsync(delivery.UserId, notificationType.Value, NotificationChannel.Email, CancellationToken.None)
            : Task.FromResult(false);
    }

    private async Task<EmailMessage?> CreateTaskCreatedMessageAsync(EventDelivery delivery)
    {
        var task = await _db.ApprovalRequestTasks
            .Include(item => item.ApprovalRequest)
                .ThenInclude(request => request.CreatedByUser)
            .Include(item => item.ApprovalRequest)
                .ThenInclude(request => request.RequestFiles)
                    .ThenInclude(file => file.UserFile)
            .FirstOrDefaultAsync(item => item.GlobalId == delivery.DomainEvent.EntityGlobalId);
        return task is null ? null : CreateMessage(delivery.User, task.ApprovalRequest, "ApprovalRequestSent", "inbox");
    }

    private async Task<EmailMessage?> CreateRequestMessageAsync(EventDelivery delivery, string templateName, string route)
    {
        var request = await _db.ApprovalRequests
            .Include(item => item.CreatedByUser)
            .Include(item => item.RequestFiles)
                .ThenInclude(file => file.UserFile)
            .FirstOrDefaultAsync(item => item.GlobalId == delivery.DomainEvent.EntityGlobalId);
        return request is null ? null : CreateMessage(delivery.User, request, templateName, route);
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
                string.Format(_configuration[$"Email:Templates:{templateName}Message"]!, request.CreatedByUser.NormalizedEmailOrEmpty(), GetActiveFileNames(request)),
                link,
                _configuration[$"Email:Templates:{templateName}LinkText"]!)
        };
    }

    private static string GetActiveFileNames(ApprovalRequest request) => string.Join(", ", request.RequestFiles
        .Where(file => file.RevisionAction != ApprovalRequestFileRevisionAction.Removed)
        .OrderBy(file => file.Sequence)
        .Select(file => file.UserFile.Name));
}
