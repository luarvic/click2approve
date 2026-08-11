namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Identifies in-app notification deliveries to mark as read.
/// </summary>
public class InAppNotificationsReadDto
{
    public required List<Guid> DeliveryGlobalIds { get; set; }
}
