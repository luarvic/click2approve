namespace Click2Approve.Application.Models.Commands.ApprovalRequests;

/// <summary>
/// Represents a data transfer object required to submit an approval request.
/// </summary>
public class SubmitApprovalRequestCommand
{
    public required string Title { get; set; }
    public Guid? PreviousRevisionApprovalRequestGlobalId { get; set; }
    public List<ApprovalRequestFileCommand> RequestFiles { get; set; } = [];
    public List<ApprovalRequestStepCommand> Steps { get; set; } = [];
    public string? Description { get; set; }
}
