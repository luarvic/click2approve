namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents delivery of a domain event to one user through one client channel.
/// </summary>
public class EventDelivery : DbEntity
{
    // Foreign key identifiers
    public required long DomainEventId { get; set; }
    public long TenantId { get; set; }
    public required string UserId { get; set; }

    // Scalar properties
    public required EventDeliveryChannel Channel { get; set; }
    public int AttemptCount { get; set; }
    public string? LastError { get; set; }
    public DateTime? QueuedAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? SentAt { get; set; }

    // Navigation properties
    public DomainEvent DomainEvent { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}
