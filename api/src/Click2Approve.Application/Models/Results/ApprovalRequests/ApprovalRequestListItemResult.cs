using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Results.ApprovalRequests;

/// <summary>
/// Represents an approval request displayed in the Requests list.
/// </summary>
public class ApprovalRequestListItemResult
{
    public Guid GlobalId { get; init; }
    public required string Title { get; init; }
    public ApprovalRequestStatus Status { get; init; }
    public bool? Result { get; init; }
    public DateTime CreatedAt { get; init; }
    public required string CreatedByDisplayName { get; init; }
    public int RevisionNumber { get; init; }
}
