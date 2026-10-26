using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Events;

/// <summary>
/// Represents one notification request for one recipient.
/// TenantId identifies the recipient workspace; OriginTenantId identifies the approval request workspace.
/// </summary>
public sealed record NotificationEventPayload(
    NotificationType Type,
    long TenantId,
    long OriginTenantId,
    Guid? TargetResourceGlobalId,
    NotificationResourceType? TargetResourceType,
    string Summary,
    long UserId,
    Guid? SourceResourceGlobalId = null,
    NotificationResourceType? SourceResourceType = null,
    DateTime? RetentionDeletionAt = null);
