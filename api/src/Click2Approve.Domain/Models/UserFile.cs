namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a user file.
/// </summary>
public class UserFile : DbEntity
{
    // Foreign key identifiers
    /// <summary>The user who uploaded the file.</summary>
    public required long OwnerId { get; set; }
    /// <summary>The workspace that owns the file, which may differ from the uploader's current workspace.</summary>
    public long TenantId { get; set; }

    // Scalar properties
    public required DateTime CreatedAt { get; set; }
    public required string Name { get; set; }
    public required long Size { get; set; }
    public DateTime? DeletionPublishedAt { get; set; }
    public DateTime? ScheduledForDeletionAt { get; set; }
    public UserFileStatus Status { get; set; } = UserFileStatus.Uploaded;
    public required UserFileStorageType StorageType { get; set; }
    public required string Type { get; set; }

    // Navigation properties
    public List<ApprovalRequestFile> ApprovalRequestFiles { get; set; } = [];
    public AppUser Owner { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
}
