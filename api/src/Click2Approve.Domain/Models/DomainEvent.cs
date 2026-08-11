namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an immutable business fact and its reference-only resource data.
/// </summary>
public class DomainEvent : DbEntity
{
    // Foreign key identifiers
    public long TenantId { get; set; }

    // Scalar properties
    public required Guid EntityGlobalId { get; set; }
    public required DateTime OccurredAt { get; set; }
    public required DomainEventType Type { get; set; }
}
