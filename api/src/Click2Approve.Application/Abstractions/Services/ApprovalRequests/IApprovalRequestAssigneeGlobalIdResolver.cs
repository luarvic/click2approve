using Click2Approve.Application.Models.ApprovalRequests;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.ApprovalRequests;

public interface IApprovalRequestAssigneeGlobalIdResolver
{
    Task<ApprovalRequestAssigneeGlobalIdMaps> ResolveAsync(
        ApprovalRequest approvalRequest,
        CancellationToken cancellationToken);
}
