namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approval request task.
/// </summary>
public class ApprovalRequestTask : DbEntity
{
    // Foreign key identifiers
    public long ApprovalRequestId { get; set; }
    public long? ApprovalRequestStepApproverId { get; set; }
    public long ApprovalRequestStepId { get; set; }
    public long? ApproverEmployeeId { get; set; }
    public string? ApproverUserId { get; set; }
    public long TenantId { get; set; }

    // Scalar properties
    public required ApprovalRequestTaskAction Action { get; set; }
    public string? ApproverBrowserData { get; set; }
    public required string ApproverDisplayName { get; set; }
    public string? ApproverIpAddress { get; set; }
    public string? ApproverLegalName { get; set; }
    public string? ApproverOrganizationDisplayName { get; set; }
    public string? ApproverSignatureJson { get; set; }
    public string? Comment { get; set; }
    public DateTime? CompletedAt { get; set; }
    public required DateTime CreatedAt { get; set; }
    public string? Description { get; set; }
    public int RevisionNumber { get; set; } = 1;
    public bool? Result { get; set; }
    public ApprovalRequestTaskStatus Status { get; set; }
    public required string Title { get; set; }

    // Navigation properties
    /// <summary>
    /// Direct request relationship used for request-wide task queries and state
    /// changes. The task also belongs to a specific workflow step.
    /// </summary>
    public ApprovalRequest ApprovalRequest { get; set; } = null!;

    /// <summary>
    /// Step relationship used as the canonical response grouping for request
    /// details. It points to the same task row as the request relationship.
    /// </summary>
    public ApprovalRequestStep ApprovalRequestStep { get; set; } = null!;

    public ApprovalRequestStepApprover? ApprovalRequestStepApprover { get; set; }
    public AppUser? ApproverUser { get; set; }
    public Tenant? Tenant { get; set; }
}
