using Click2Approve.Application.Models.Auxiliary.ApprovalRequests;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

public class DefaultApprovalRequestApproverGlobalIdResolver : IApprovalRequestApproverGlobalIdResolver
{
    public Task<ApprovalRequestApproverGlobalIdMaps> ResolveAsync(
        ApprovalRequest approvalRequest,
        CancellationToken cancellationToken) =>
        Task.FromResult(ApprovalRequestApproverGlobalIdMaps.Empty);
}
