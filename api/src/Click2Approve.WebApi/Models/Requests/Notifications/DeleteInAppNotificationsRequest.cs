namespace Click2Approve.WebApi.Models.Requests.Notifications;

/// <summary>
/// Identifies in-app notifications to delete.
/// </summary>
public class DeleteInAppNotificationsRequest
{
    public required List<Guid> NotificationGlobalIds { get; set; }
}
