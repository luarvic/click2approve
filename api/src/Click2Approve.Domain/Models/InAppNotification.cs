namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a durable in-app notification for one recipient.
/// </summary>
public class InAppNotification : DbEntity
{
    // Foreign key identifiers
    public required long TenantId { get; set; }
    public required long UserId { get; set; }

    // Scalar properties
    public required Guid EntityGlobalId { get; set; }
    public required Guid EventId { get; set; }
    public required NotificationType Type { get; set; }
    public required DateTime OccurredAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public required string Summary { get; set; }

    // Navigation properties
    public AppUser User { get; set; } = null!;
}
