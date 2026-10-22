using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Requests.ApprovalRequests;

/// <summary>
/// Represents a file submitted with approval request revision metadata.
/// </summary>
public class ApprovalRequestFileRequest
{
    /// <summary>Global identifier of the user file.</summary>
    public Guid UserFileGlobalId { get; set; }
    /// <summary>Position of the item in its ordered list.</summary>
    public int Sequence { get; set; }
    /// <summary>Action to take for this file in the request revision.</summary>
    public ApprovalRequestFileRevisionAction RevisionAction { get; set; }
    /// <summary>Global identifier of the file in the previous request revision.</summary>
    public Guid? PreviousApprovalRequestFileGlobalId { get; set; }
}
