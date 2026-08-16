namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a business tenant.
/// </summary>
public class Tenant : DbEntity
{
    // Foreign key identifiers
    public long? LogoUserFileId { get; set; }

    // Scalar properties
    public string? Address { get; set; }
    public required string BusinessName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public required TenantType Type { get; set; }
    public string? WebsiteUrl { get; set; }

    // Navigation properties
    public List<ApprovalRequest> ApprovalRequests { get; set; } = [];
    public List<ApprovalRequestTask> ApprovalRequestTasks { get; set; } = [];
    public UserFile? LogoUserFile { get; set; }
    public AppUser Owner { get; set; } = null!;
    public List<UserFile> UserFiles { get; set; } = [];
}
