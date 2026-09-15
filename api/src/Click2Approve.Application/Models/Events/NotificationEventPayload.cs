using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Events;

/// <summary>
/// Represents one notification request for one recipient.
/// </summary>
public sealed record NotificationEventPayload(
    NotificationType Type,
    long TenantId,
    Guid? TargetResourceGlobalId,
    NotificationResourceType? TargetResourceType,
    string Summary,
    long UserId,
    Guid? SourceResourceGlobalId = null,
    NotificationResourceType? SourceResourceType = null);
