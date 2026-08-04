namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a user file.
/// </summary>
public class UserFile : DbEntity
{
    // Foreign key identifiers
    public required string OwnerId { get; set; }
    public long TenantId { get; set; }

    // Scalar properties
    public required DateTime CreatedAt { get; set; }
    public required string Name { get; set; }
    public required long Size { get; set; }
    public required string Type { get; set; }

    // Navigation properties
    public List<ApprovalRequestFile> ApprovalRequestFiles { get; set; } = [];
    public AppUser? Owner { get; set; }
    public Tenant? Tenant { get; set; }
}
