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
    public DateTime? DeletionPublishedAt { get; set; }
    public required Guid EventId { get; set; }
    public required DateTime OccurredAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public required string Summary { get; set; }
    public Guid? TargetResourceGlobalId { get; set; }
    public NotificationResourceType? TargetResourceType { get; set; }
    public required NotificationType Type { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}
