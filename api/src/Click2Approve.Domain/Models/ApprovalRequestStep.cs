namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents one stage in an approval request workflow.
/// </summary>
public class ApprovalRequestStep : DbEntity
{
    public long ApprovalRequestId { get; set; }
    public ApprovalRequest ApprovalRequest { get; set; } = null!;
    public required int Sequence { get; set; }
    public required ApprovalStepMode Mode { get; set; }
    public required List<ApprovalRequestStepApprover> Approvers { get; set; }
    public required List<ApprovalRequestTask> Tasks { get; set; }
}
