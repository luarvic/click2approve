namespace Click2Approve.Application.Models.Commands.Notifications;

/// <summary>
/// Identifies in-app notification deliveries to mark as read.
/// </summary>
public class ReadInAppNotificationsCommand
{
    public required List<Guid> DeliveryGlobalIds { get; set; }
}
