using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

public interface IApprovalRecipientResolver
{
    Task<Dictionary<ApprovalRequestStepApprover, List<ApprovalRecipientResolution>>> ResolveAsync(
        ApprovalRequest approvalRequest,
        IReadOnlyCollection<ApprovalRecipientResolveItem> approvers,
        CancellationToken cancellationToken);

    Task<List<ApprovalRecipientResolution>> ResolveAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        ApprovalRequestStepApprover approver,
        CancellationToken cancellationToken);
}
