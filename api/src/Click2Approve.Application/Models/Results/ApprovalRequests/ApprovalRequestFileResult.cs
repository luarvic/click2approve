using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Results.ApprovalRequests;

/// <summary>
/// Represents a file attached to an approval request with revision metadata.
/// </summary>
public class ApprovalRequestFileResult
{
    public Guid GlobalId { get; init; }
    public required UserFileResult UserFile { get; init; }
    public int Sequence { get; init; }
    public ApprovalRequestFileRevisionAction RevisionAction { get; init; }
    public Guid? PreviousApprovalRequestFileGlobalId { get; init; }
    public UserFileResult? PreviousUserFile { get; init; }
}
