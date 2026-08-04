namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approver configured for an approval workflow step.
/// </summary>
public class ApprovalRequestStepApprover : DbEntity
{
    // Foreign key identifiers
    public long ApprovalRequestStepId { get; set; }
    public long? EmployeeId { get; set; }
    public long? TeamId { get; set; }
    public string? UserId { get; set; }

    // Scalar properties
    public string? ApproverDisplayName { get; set; }
    public required ApprovalRecipientType Type { get; set; }

    // Navigation properties
    public ApprovalRequestStep ApprovalRequestStep { get; set; } = null!;
    public List<ApprovalRequestStepVisibility> StepVisibilities { get; set; } = [];
    public List<ApprovalRequestTask> Tasks { get; set; } = [];
    public AppUser? User { get; set; }
}
