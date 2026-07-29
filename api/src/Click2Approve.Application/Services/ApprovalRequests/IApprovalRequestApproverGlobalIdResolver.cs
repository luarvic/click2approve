using Click2Approve.Application.Models.Auxiliary.ApprovalRequests;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

public interface IApprovalRequestApproverGlobalIdResolver
{
    Task<ApprovalRequestApproverGlobalIdMaps> ResolveAsync(
        ApprovalRequest approvalRequest,
        CancellationToken cancellationToken);
}
