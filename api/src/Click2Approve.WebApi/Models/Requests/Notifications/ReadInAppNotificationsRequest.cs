namespace Click2Approve.WebApi.Models.Requests.Notifications;

/// <summary>
/// Identifies in-app notifications to mark as read.
/// </summary>
public class ReadInAppNotificationsRequest
{
    public required List<Guid> NotificationGlobalIds { get; set; }
}
