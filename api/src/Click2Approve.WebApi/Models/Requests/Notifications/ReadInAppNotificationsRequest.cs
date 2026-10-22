namespace Click2Approve.WebApi.Models.Requests.Notifications;

/// <summary>
/// Identifies in-app notifications to mark as read.
/// </summary>
public class ReadInAppNotificationsRequest
{
    /// <summary>Global identifiers of the notifications to mark as read.</summary>
    public required List<Guid> NotificationGlobalIds { get; set; }
}
