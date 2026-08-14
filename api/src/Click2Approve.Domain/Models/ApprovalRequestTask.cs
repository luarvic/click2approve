namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approval request task.
/// </summary>
public class ApprovalRequestTask : DbEntity
{
    // Foreign key identifiers
    public long ApprovalRequestId { get; set; }
    public long? ApprovalRequestStepAssigneeId { get; set; }
    public long ApprovalRequestStepId { get; set; }
    public long? AssigneeEmployeeId { get; set; }
    public required string AssigneeUserId { get; set; }
    public long? CompletedByEmployeeId { get; set; }
    public string? CompletedByUserId { get; set; }
    public long TenantId { get; set; }

    // Scalar properties
    public required ApprovalRequestTaskAction Action { get; set; }
    public string? AssigneeBrowserData { get; set; }
    public required string AssigneeDisplayName { get; set; }
    public string? AssigneeIpAddress { get; set; }
    public string? AssigneeLegalName { get; set; }
    public string? AssigneeOrganization { get; set; }
    public string? AssigneeSignatureJson { get; set; }
    public string? Comment { get; set; }
    public string? CompletedByDisplayName { get; set; }
    public DateTime? CompletedAt { get; set; }
    public required DateTime CreatedAt { get; set; }
    public string? Description { get; set; }
    public string? OrganizationDisplayName { get; set; }
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

    public ApprovalRequestStepAssignee? ApprovalRequestStepAssignee { get; set; }
    public AppUser AssigneeUser { get; set; } = null!;
    public AppUser? CompletedByUser { get; set; }
    public Tenant Tenant { get; set; } = null!;

    /// <summary>
    /// Files attached directly to this task when the active product supports task attachments.
    /// </summary>
    public List<UserFile> TaskFiles { get; set; } = [];
}
