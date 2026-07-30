namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approval request task.
/// </summary>
public class ApprovalRequestTask : DbEntity
{
    public required string Title { get; set; }
    /// <summary>
    /// Direct request relationship used for request-wide task queries and state
    /// changes. The task also belongs to a specific workflow step.
    /// </summary>
    public long ApprovalRequestId { get; set; }
    public ApprovalRequest ApprovalRequest { get; set; } = null!;
    /// <summary>
    /// Step relationship used as the canonical response grouping for request
    /// details. It points to the same task row as the request relationship.
    /// </summary>
    public long ApprovalRequestStepId { get; set; }
    public ApprovalRequestStep ApprovalRequestStep { get; set; } = null!;
    public long? ApprovalRequestStepApproverId { get; set; }
    public ApprovalRequestStepApprover? ApprovalRequestStepApprover { get; set; }
    public string? ApproverUserId { get; set; }
    public AppUser? ApproverUser { get; set; }
    public long? ApproverEmployeeId { get; set; }
    public required string ApproverDisplayName { get; set; }
    public required string ApproverEmail { get; set; }
    public long TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public int RevisionNumber { get; set; } = 1;
    public ApprovalRequestTaskStatus Status { get; set; }
    public required DateTime CreatedAt { get; set; }
    public string? Description { get; set; }
    public string? Comment { get; set; }
    public List<ApprovalRequestTaskLogEntry> LogEntries { get; set; } = [];
}
