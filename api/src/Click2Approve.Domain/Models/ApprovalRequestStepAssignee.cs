namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an assignee configured for an approval workflow step.
/// </summary>
public class ApprovalRequestStepAssignee : DbEntity
{
    // Foreign key identifiers
    public long ApprovalRequestStepId { get; set; }
    public long? EmployeeId { get; set; }
    public long? TeamId { get; set; }
    public string? UserId { get; set; }

    // Scalar properties
    public string? AssigneeDisplayName { get; set; }
    public required AssigneeType Type { get; set; }

    // Navigation properties
    public ApprovalRequestStep ApprovalRequestStep { get; set; } = null!;
    public List<ApprovalRequestStepVisibility> StepVisibilities { get; set; } = [];
    public List<ApprovalRequestTask> Tasks { get; set; } = [];
    public AppUser? User { get; set; }
}
