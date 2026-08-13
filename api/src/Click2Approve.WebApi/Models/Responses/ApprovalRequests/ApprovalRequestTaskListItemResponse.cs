using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents an approval request task displayed in an inbox list.
/// </summary>
public class ApprovalRequestTaskListItemResponse
{
    public Guid GlobalId { get; init; }
    public required string Title { get; init; }
    public ApprovalRequestTaskAction Action { get; init; }
    public ApprovalRequestTaskStatus Status { get; init; }
    public bool? Result { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public required string RequestedByEmail { get; init; }
    public required string RequestedByDisplayName { get; init; }
    public required string OrganizationDisplayName { get; init; }
    public int RevisionNumber { get; init; }
}
