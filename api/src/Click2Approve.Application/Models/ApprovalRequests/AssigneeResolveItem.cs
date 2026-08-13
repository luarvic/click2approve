using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.ApprovalRequests;

/// <summary>
/// Describes one configured assignee that must be resolved for an approval request.
/// </summary>
public sealed record AssigneeResolveItem(
    ApprovalRequestStep Step,
    ApprovalRequestStepAssignee Assignee,
    string? Email = null,
    Guid? EmployeeGlobalId = null,
    Guid? TeamGlobalId = null);
