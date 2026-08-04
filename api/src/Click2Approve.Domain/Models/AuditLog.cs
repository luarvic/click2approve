namespace Click2Approve.Domain.Models;

/// <summary>
/// Records a persisted domain entity change.
/// </summary>
public class AuditLog : DbEntity
{
    // Foreign key identifiers
    public string? UserId { get; set; }

    // Scalar properties
    public required string ChangesJson { get; set; }
    public required long EntityId { get; set; }
    public required string EntityState { get; set; }
    public required string EntityType { get; set; }
    public required DateTime Timestamp { get; set; }
}
