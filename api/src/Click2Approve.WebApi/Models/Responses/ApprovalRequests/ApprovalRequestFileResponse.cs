using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents a file attached to an approval request with revision metadata.
/// </summary>
public class ApprovalRequestFileResponse
{
    public Guid GlobalId { get; init; }
    public required UserFileResponse UserFile { get; init; }
    public int Sequence { get; init; }
    public ApprovalRequestFileRevisionAction RevisionAction { get; init; }
    public Guid? PreviousApprovalRequestFileGlobalId { get; init; }
    public UserFileResponse? PreviousUserFile { get; init; }
}
