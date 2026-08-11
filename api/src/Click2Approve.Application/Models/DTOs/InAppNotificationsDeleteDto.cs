namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Identifies in-app notification deliveries to delete.
/// </summary>
public class InAppNotificationsDeleteDto
{
    public required List<Guid> DeliveryGlobalIds { get; set; }
}
