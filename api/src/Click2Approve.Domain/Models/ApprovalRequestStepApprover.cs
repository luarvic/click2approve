namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approver configured for an approval workflow step.
/// </summary>
public class ApprovalRequestStepApprover : DbEntity
{
    public long ApprovalRequestStepId { get; set; }
    public ApprovalRequestStep ApprovalRequestStep { get; set; } = null!;
    public required ApprovalRecipientType Type { get; set; }
    public string? UserId { get; set; }
    public AppUser? User { get; set; }
    public long? EmployeeId { get; set; }
    public long? TeamId { get; set; }
    public string? ApproverDisplayName { get; set; }
    public List<ApprovalRequestTask> Tasks { get; set; } = [];
    public List<ApprovalRequestStepVisibility> StepVisibilities { get; set; } = [];
}
