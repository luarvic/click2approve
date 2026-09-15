using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Commands.Notifications;

/// <summary>
/// Contains the information required to send one notification to one or more recipients.
/// </summary>
public record NotificationCommand(
    NotificationType Type,
    long TenantId,
    Guid? TargetResourceGlobalId,
    NotificationResourceType? TargetResourceType,
    string Summary,
    IReadOnlyCollection<NotificationRecipient> Recipients,
    Guid? SourceResourceGlobalId = null,
    NotificationResourceType? SourceResourceType = null);

/// <summary>
/// Identifies one intended notification recipient.
/// </summary>
public record NotificationRecipient(long UserId);
