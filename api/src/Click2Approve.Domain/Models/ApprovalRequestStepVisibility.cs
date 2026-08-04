namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents whether a configured approver can see a request workflow step.
/// </summary>
public class ApprovalRequestStepVisibility : DbEntity
{
    // Foreign key identifiers
    public long ApprovalRequestStepApproverId { get; set; }
    public long ApprovalRequestStepId { get; set; }

    // Scalar properties
    public required bool IsVisible { get; set; }

    // Navigation properties
    public ApprovalRequestStepApprover ApprovalRequestStepApprover { get; set; } = null!;
    public ApprovalRequestStep ApprovalRequestStep { get; set; } = null!;
}
