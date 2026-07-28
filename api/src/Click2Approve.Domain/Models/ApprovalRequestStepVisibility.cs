namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents whether a configured approver can see a request workflow step.
/// </summary>
public class ApprovalRequestStepVisibility : DbEntity
{
    public long ApprovalRequestStepId { get; set; }
    public ApprovalRequestStep ApprovalRequestStep { get; set; } = null!;
    public long ApprovalRequestStepApproverId { get; set; }
    public ApprovalRequestStepApprover ApprovalRequestStepApprover { get; set; } = null!;
    public required bool IsVisible { get; set; }
}
