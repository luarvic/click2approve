using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Responses.Notifications;

/// <summary>
/// Represents an in-app domain event delivery.
/// </summary>
public class InAppNotificationResponse
{
    public required Guid GlobalId { get; set; }
    public required NotificationType Type { get; set; }
    public required DateTime OccurredAt { get; set; }
    public required Guid EntityGlobalId { get; set; }
    public required string Summary { get; set; }
    public DateTime? ReadAt { get; set; }
}
