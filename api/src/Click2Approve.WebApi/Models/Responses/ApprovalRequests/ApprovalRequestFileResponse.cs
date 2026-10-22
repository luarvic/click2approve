using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents a file attached to an approval request with revision metadata.
/// </summary>
public class ApprovalRequestFileResponse
{
    /// <summary>Global identifier of the approval request file.</summary>
    public Guid GlobalId { get; init; }
    /// <summary>User file attached to the request.</summary>
    public required UserFileResponse UserFile { get; init; }
    /// <summary>Position of the item in its ordered list.</summary>
    public int Sequence { get; init; }
    /// <summary>Action to take for this file in the request revision.</summary>
    public ApprovalRequestFileRevisionAction RevisionAction { get; init; }
    /// <summary>Global identifier of the file in the previous request revision.</summary>
    public Guid? PreviousApprovalRequestFileGlobalId { get; init; }
    /// <summary>User file linked to the previous request revision.</summary>
    public UserFileResponse? PreviousUserFile { get; init; }
}
