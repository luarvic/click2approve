namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents whether a configured assignee can see a request workflow step.
/// </summary>
public class ApprovalRequestStepVisibility : DbEntity
{
    // Foreign key identifiers
    public long ApprovalRequestStepAssigneeId { get; set; }
    public long ApprovalRequestStepId { get; set; }

    // Scalar properties
    public required bool IsVisible { get; set; }

    // Navigation properties
    public ApprovalRequestStepAssignee ApprovalRequestStepAssignee { get; set; } = null!;
    public ApprovalRequestStep ApprovalRequestStep { get; set; } = null!;
}
