using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents an assignee returned with an approval request step.
/// </summary>
public class ApprovalRequestAssigneeResponse
{
    public Guid GlobalId { get; init; }
    public AssigneeType Type { get; init; }
    public string? Email { get; init; }
    public Guid? EmployeeGlobalId { get; init; }
    public Guid? TeamGlobalId { get; init; }
    public string? DisplayName { get; init; }
}
