using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Responses.Notifications;

/// <summary>
/// Represents an in-app domain event delivery.
/// </summary>
public class InAppNotificationResponse
{
    /// <summary>Global identifier of the in-app notification.</summary>
    public required Guid GlobalId { get; set; }
    /// <summary>Type of the notification event.</summary>
    public required NotificationType Type { get; set; }
    /// <summary>Time when the notification event occurred.</summary>
    public required DateTime OccurredAt { get; set; }
    /// <summary>Global identifier of the resource linked to the notification.</summary>
    public Guid? TargetResourceGlobalId { get; set; }
    /// <summary>Type of resource linked to the notification.</summary>
    public NotificationResourceType? TargetResourceType { get; set; }
    /// <summary>Short description of the notification.</summary>
    public required string Summary { get; set; }
    /// <summary>Time when the notification was read.</summary>
    public DateTime? ReadAt { get; set; }
}
