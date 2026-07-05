namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approval request.
/// </summary>
public class ApprovalRequest : DbEntity
{
    public required DateTime Submitted { get; set; }
    public required string Author { get; set; }
    public long TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public required ApprovalStatus Status { get; set; }
    public required List<UserFile> UserFiles { get; set; }
    public required List<string> Approvers { get; set; }
    public DateTime? ApproveBy { get; set; }
    public required string? Comment { get; set; }
    public required List<ApprovalRequestTask> Tasks { get; set; }
}
