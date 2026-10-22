using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents an approval request displayed in the Requests list.
/// </summary>
public class ApprovalRequestListItemResponse
{
    /// <summary>Global identifier of the approval request.</summary>
    public Guid GlobalId { get; init; }
    /// <summary>Title of the approval request or task.</summary>
    public required string Title { get; init; }
    /// <summary>Current status of the approval request.</summary>
    public ApprovalRequestStatus Status { get; init; }
    /// <summary>Final result of the approval request, when available.</summary>
    public bool? Result { get; init; }
    /// <summary>Time when the approval request was created.</summary>
    public DateTime CreatedAt { get; init; }
    /// <summary>Display name of the request owner.</summary>
    public required string RequesterDisplayName { get; init; }
    /// <summary>Revision number of the approval request.</summary>
    public int RevisionNumber { get; init; }
}
