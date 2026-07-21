namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approval request.
/// </summary>
public class ApprovalRequest : DbEntity
{
    public required string Title { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required string CreatedByUserId { get; set; }
    public AppUser CreatedByUser { get; set; } = null!;
    public long? CreatedByEmployeeId { get; set; }
    public required string CreatedByEmail { get; set; }
    public required string CreatedByDisplayName { get; set; }
    public long TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public required ApprovalRequestStatus Status { get; set; }
    public required List<UserFile> UserFiles { get; set; }
    public required List<ApprovalRequestStep> Steps { get; set; }
    public required string? Description { get; set; }
    public required List<ApprovalRequestTask> Tasks { get; set; }
    public List<ApprovalRequestLogEntry> LogEntries { get; set; } = [];
}
