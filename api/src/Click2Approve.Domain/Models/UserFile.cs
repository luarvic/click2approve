namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a user file.
/// </summary>
public class UserFile : DbEntity
{
    // Foreign key identifiers
    public required long OwnerId { get; set; }
    public long TenantId { get; set; }

    // Scalar properties
    public required DateTime CreatedAt { get; set; }
    public required string Name { get; set; }
    public required long Size { get; set; }
    public DateTime? ScheduledForDeletionAt { get; set; }
    public UserFileStatus Status { get; set; } = UserFileStatus.Uploaded;
    public required UserFileStorageType StorageType { get; set; }
    public required string Type { get; set; }

    // Navigation properties
    public List<ApprovalRequestFile> ApprovalRequestFiles { get; set; } = [];
    public AppUser Owner { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
}
