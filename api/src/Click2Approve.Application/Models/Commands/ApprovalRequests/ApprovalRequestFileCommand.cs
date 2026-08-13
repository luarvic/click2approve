using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Commands.ApprovalRequests;

/// <summary>
/// Represents a file submitted with approval request revision metadata.
/// </summary>
public class ApprovalRequestFileCommand
{
    public Guid UserFileGlobalId { get; set; }
    public int Sequence { get; set; }
    public ApprovalRequestFileRevisionAction RevisionAction { get; set; }
    public Guid? PreviousApprovalRequestFileGlobalId { get; set; }
}
