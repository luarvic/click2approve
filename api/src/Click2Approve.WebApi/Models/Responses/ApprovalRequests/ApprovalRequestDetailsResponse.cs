namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents an approval request returned to its author.
/// </summary>
public class ApprovalRequestDetailsResponse : ApprovalRequestListItemResponse
{
    public required List<ApprovalRequestFileResponse> RequestFiles { get; init; }
    public required List<ApprovalRequestStepResponse> Steps { get; init; }
    public string? Description { get; init; }
    public DateTime? CompletedAt { get; init; }
    public Guid CreatedByUserGlobalId { get; init; }
    public Guid? CreatedByEmployeeGlobalId { get; init; }
    public required string CreatedByEmail { get; init; }
    public Guid? CompletedByUserGlobalId { get; init; }
    public Guid? CompletedByEmployeeGlobalId { get; init; }
    public string? CompletedByDisplayName { get; init; }
    public string? CompletedByEmail { get; init; }
    public required string OrganizationDisplayName { get; init; }
    public Guid? PreviousRevisionApprovalRequestGlobalId { get; init; }
    public string? PreviousRevisionApprovalRequestTitle { get; init; }
    public Guid? NextRevisionApprovalRequestGlobalId { get; init; }
    public string? NextRevisionApprovalRequestTitle { get; init; }
}
