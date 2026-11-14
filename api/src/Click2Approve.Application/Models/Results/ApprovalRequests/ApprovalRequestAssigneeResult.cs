using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Results.ApprovalRequests;

/// <summary>
/// Represents an assignee returned with an approval request step.
/// </summary>
public class ApprovalRequestAssigneeResult
{
    public Guid GlobalId { get; init; }
    public AssigneeType Type { get; init; }
    public bool AccountSignInRequired { get; init; } = true;
    public string? Email { get; init; }
    public Guid? EmployeeGlobalId { get; init; }
    public Guid? TeamGlobalId { get; init; }
    public string? DisplayName { get; init; }
}
