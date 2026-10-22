namespace Click2Approve.Application.Models.Commands.ApprovalRequests;

/// <summary>
/// Represents a data transfer object required to resubmit an approval request.
/// </summary>
public class ResubmitApprovalRequestCommand
{
    public List<ApprovalRequestFileCommand> RequestFiles { get; set; } = [];
    public List<ApprovalRequestStepCommand> Steps { get; set; } = [];
    public string? Description { get; set; }
}
