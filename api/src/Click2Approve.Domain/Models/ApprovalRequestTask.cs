namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approval request task.
/// </summary>
/// <remarks>
/// The request relationship supports request-wide queries and state changes;
/// the step relationship groups the same task row in workflow responses.
/// Task attachments are available only when enabled by the active product.
/// </remarks>
public class ApprovalRequestTask : DbEntity
{
    // Foreign key identifiers
    public long ApprovalRequestId { get; set; }
    public long? ApprovalRequestStepAssigneeId { get; set; }
    public long ApprovalRequestStepId { get; set; }
    public long? AssigneeEmployeeId { get; set; }
    public required long AssigneeUserId { get; set; }
    public long? CompletedByEmployeeId { get; set; }
    public long? CompletedByUserId { get; set; }
    public long TenantId { get; set; }

    // Scalar properties
    public required ApprovalRequestTaskAction Action { get; set; }
    public string? AssigneeBrowserData { get; set; }
    public required string AssigneeDisplayName { get; set; }
    public string? AssigneeIpAddress { get; set; }
    public string? AssigneeLegalName { get; set; }
    public string? AssigneeRepresentationDetails { get; set; }
    public string? AssigneeSignatureJson { get; set; }
    public string? Comment { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? CompletedByDisplayName { get; set; }
    public bool? CompletedViaEmailLink { get; set; }
    public required DateTime CreatedAt { get; set; }
    public string? Description { get; set; }
    public string? Instructions { get; set; }
    public bool IsAttachmentRequired { get; set; }
    public bool IsCommentRequired { get; set; }
    public bool IsElectronicSignatureRequired { get; set; }
    public string? OrganizationDisplayName { get; set; }
    public bool? Result { get; set; }
    public int RevisionNumber { get; set; } = 1;
    public ApprovalRequestTaskStatus Status { get; set; }
    public required string Title { get; set; }

    // Navigation properties
    public ApprovalRequest ApprovalRequest { get; set; } = null!;
    public ApprovalRequestStep ApprovalRequestStep { get; set; } = null!;
    public ApprovalRequestStepAssignee? ApprovalRequestStepAssignee { get; set; }
    public AppUser AssigneeUser { get; set; } = null!;
    public AppUser? CompletedByUser { get; set; }
    public List<UserFile> TaskFiles { get; set; } = [];
    public Tenant Tenant { get; set; } = null!;
}
