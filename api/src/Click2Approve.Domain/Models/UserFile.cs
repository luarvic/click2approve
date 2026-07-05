namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a user file.
/// </summary>
public class UserFile : DbEntity
{
    public required string Name { get; set; }
    public required string Type { get; set; }
    public required DateTime Created { get; set; }
    public required string OwnerId { get; set; }
    public AppUser? Owner { get; set; }
    public long TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public required long Size { get; set; }
    public List<ApprovalRequest> ApprovalRequests { get; set; } = [];
}
