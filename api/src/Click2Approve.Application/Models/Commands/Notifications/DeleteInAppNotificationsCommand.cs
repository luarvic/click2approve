namespace Click2Approve.Application.Models.Commands.Notifications;

/// <summary>
/// Identifies in-app notification deliveries to delete.
/// </summary>
public class DeleteInAppNotificationsCommand
{
    public required List<Guid> NotificationGlobalIds { get; set; }
}
