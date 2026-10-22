using Click2Approve.Application.Models.ApprovalRequests;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.ApprovalRequests;

public interface IAssigneeResolver
{
    Task<Dictionary<ApprovalRequestStepAssignee, List<AssigneeResolution>>> ResolveAsync(
        ApprovalRequest approvalRequest,
        IReadOnlyCollection<AssigneeResolveItem> assignees,
        CancellationToken cancellationToken);

    Task<List<AssigneeResolution>> ResolveAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        ApprovalRequestStepAssignee assignee,
        CancellationToken cancellationToken);
}
