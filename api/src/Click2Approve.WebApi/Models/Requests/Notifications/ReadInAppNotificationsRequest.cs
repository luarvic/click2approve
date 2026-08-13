namespace Click2Approve.WebApi.Models.Requests.Notifications;

/// <summary>
/// Identifies in-app notification deliveries to mark as read.
/// </summary>
public class ReadInAppNotificationsRequest
{
    public required List<Guid> DeliveryGlobalIds { get; set; }
}
