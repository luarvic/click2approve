namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approval request task.
/// </summary>
public class ApprovalRequestTask : DbEntity
{
    public required string Title { get; set; }
    public long ApprovalRequestId { get; set; }
    public ApprovalRequest ApprovalRequest { get; set; } = null!;
    public long ApprovalRequestStepId { get; set; }
    public ApprovalRequestStep ApprovalRequestStep { get; set; } = null!;
    public string? ApproverUserId { get; set; }
    public AppUser? ApproverUser { get; set; }
    public required string ApproverEmail { get; set; }
    public string? ApproverDisplayName { get; set; }
    public required bool CanViewRequest { get; set; }
    public long TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public ApprovalRequestTaskStatus Status { get; set; }
    public required DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Comment { get; set; }
}
