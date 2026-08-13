namespace Click2Approve.WebApi.Models.Requests.Notifications;

/// <summary>
/// Identifies in-app notification deliveries to delete.
/// </summary>
public class DeleteInAppNotificationsRequest
{
    public required List<Guid> DeliveryGlobalIds { get; set; }
}
