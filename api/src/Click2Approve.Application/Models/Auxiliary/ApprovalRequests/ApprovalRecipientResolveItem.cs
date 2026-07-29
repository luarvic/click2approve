using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Auxiliary.ApprovalRequests;

/// <summary>
/// Describes one configured approver that must be resolved for an approval request.
/// </summary>
public sealed record ApprovalRecipientResolveItem(
    ApprovalRequestStep Step,
    ApprovalRequestStepApprover Approver,
    Guid? EmployeeGlobalId = null,
    Guid? TeamGlobalId = null);
