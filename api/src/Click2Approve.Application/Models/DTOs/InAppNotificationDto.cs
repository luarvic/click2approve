using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an in-app domain event delivery.
/// </summary>
public class InAppNotificationDto
{
    public required Guid GlobalId { get; set; }
    public required DomainEventType Type { get; set; }
    public required DateTime OccurredAt { get; set; }
    public required Guid EntityGlobalId { get; set; }
    public DateTime? ReadAt { get; set; }
}
