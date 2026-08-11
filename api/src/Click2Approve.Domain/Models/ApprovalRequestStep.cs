namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents one stage in an approval request workflow.
/// </summary>
public class ApprovalRequestStep : DbEntity
{
    // Foreign key identifiers
    public long ApprovalRequestId { get; set; }

    // Scalar properties
    public required ApprovalRequestTaskAction Action { get; set; }
    public required ApprovalStepMode Mode { get; set; }
    public required int Sequence { get; set; }

    // Navigation properties
    public ApprovalRequest ApprovalRequest { get; set; } = null!;
    public List<ApprovalRequestStepAssignee> Assignees { get; set; } = [];
    public List<ApprovalRequestStepVisibility> StepVisibilities { get; set; } = [];
    public List<ApprovalRequestTask> Tasks { get; set; } = [];
}
