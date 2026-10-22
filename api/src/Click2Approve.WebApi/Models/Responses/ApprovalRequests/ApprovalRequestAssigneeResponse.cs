using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents an assignee returned with an approval request step.
/// </summary>
public class ApprovalRequestAssigneeResponse
{
    /// <summary>Global identifier of the approval request assignee.</summary>
    public Guid GlobalId { get; init; }
    /// <summary>Type of assignee.</summary>
    public AssigneeType Type { get; init; }
    /// <summary>Email address.</summary>
    public string? Email { get; init; }
    /// <summary>Global identifier of the employee.</summary>
    public Guid? EmployeeGlobalId { get; init; }
    /// <summary>Global identifier of the assigned team.</summary>
    public Guid? TeamGlobalId { get; init; }
    /// <summary>Display name of the assignee.</summary>
    public string? DisplayName { get; init; }
}
