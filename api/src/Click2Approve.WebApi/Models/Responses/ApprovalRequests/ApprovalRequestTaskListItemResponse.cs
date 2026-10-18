using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents an approval request task displayed in the Tasks list.
/// </summary>
public class ApprovalRequestTaskListItemResponse
{
    /// <summary>Global identifier of the approval request task.</summary>
    public Guid GlobalId { get; init; }
    /// <summary>Title of the approval request or task.</summary>
    public required string Title { get; init; }
    /// <summary>Action assigned to this approval step or task.</summary>
    public ApprovalRequestTaskAction Action { get; init; }
    /// <summary>Current status of the approval task.</summary>
    public ApprovalRequestTaskStatus Status { get; init; }
    /// <summary>Outcome of the approval task, when available.</summary>
    public bool? Result { get; init; }
    /// <summary>Time when the approval task was created.</summary>
    public DateTime CreatedAt { get; init; }
    /// <summary>Display name of the person who requested the approval.</summary>
    public required string RequestedByDisplayName { get; init; }
    /// <summary>Display name of the organization.</summary>
    public required string OrganizationDisplayName { get; init; }
    /// <summary>Revision number of the approval request.</summary>
    public int RevisionNumber { get; init; }
}
