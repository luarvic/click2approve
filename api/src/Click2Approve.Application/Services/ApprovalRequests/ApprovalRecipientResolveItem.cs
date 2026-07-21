using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Describes one configured approver that must be resolved for an approval request.
/// </summary>
public sealed record ApprovalRecipientResolveItem(
    ApprovalRequestStep Step,
    ApprovalRequestStepApprover Approver);
