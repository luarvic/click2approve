namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents an approval request returned to its author.
/// </summary>
public class ApprovalRequestDetailsResponse : ApprovalRequestListItemResponse
{
    /// <summary>Files attached to the approval request.</summary>
    public required List<ApprovalRequestFileResponse> RequestFiles { get; init; }
    /// <summary>Steps in the approval request.</summary>
    public required List<ApprovalRequestStepResponse> Steps { get; init; }
    /// <summary>Description of the approval request.</summary>
    public string? Description { get; init; }
    /// <summary>Time when the approval request was completed, if applicable.</summary>
    public DateTime? CompletedAt { get; init; }
    /// <summary>Global identifier of the user who submitted this revision.</summary>
    public Guid SubmittedByUserGlobalId { get; init; }
    /// <summary>Global identifier of the employee who submitted this revision.</summary>
    public Guid? SubmittedByEmployeeGlobalId { get; init; }
    /// <summary>Display name of the person who submitted this revision.</summary>
    public required string SubmittedByDisplayName { get; init; }
    /// <summary>Email address of the person who submitted this revision.</summary>
    public required string SubmittedByEmail { get; init; }
    /// <summary>Global identifier of the request owner’s user account.</summary>
    public Guid RequesterUserGlobalId { get; init; }
    /// <summary>Global identifier of the request owner’s employee record.</summary>
    public Guid? RequesterEmployeeGlobalId { get; init; }
    /// <summary>Email address of the request owner.</summary>
    public required string RequesterEmail { get; init; }
    /// <summary>Global identifier of the user who completed the request.</summary>
    public Guid? CompletedByUserGlobalId { get; init; }
    /// <summary>Global identifier of the employee who completed the request.</summary>
    public Guid? CompletedByEmployeeGlobalId { get; init; }
    /// <summary>Display name of the person who completed the approval request.</summary>
    public string? CompletedByDisplayName { get; init; }
    /// <summary>Email address of the person who completed the approval request.</summary>
    public string? CompletedByEmail { get; init; }
    /// <summary>Display name of the organization.</summary>
    public required string OrganizationDisplayName { get; init; }
    /// <summary>Global identifier of the previous request revision.</summary>
    public Guid? PreviousRevisionApprovalRequestGlobalId { get; init; }
    /// <summary>Title of the previous request revision.</summary>
    public string? PreviousRevisionApprovalRequestTitle { get; init; }
    /// <summary>Global identifier of the next request revision.</summary>
    public Guid? NextRevisionApprovalRequestGlobalId { get; init; }
    /// <summary>Title of the next request revision.</summary>
    public string? NextRevisionApprovalRequestTitle { get; init; }
}
