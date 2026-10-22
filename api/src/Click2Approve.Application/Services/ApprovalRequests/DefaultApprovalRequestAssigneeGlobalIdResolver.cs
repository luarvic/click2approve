using Click2Approve.Application.Models.ApprovalRequests;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Provides empty approval request assignee global ID resolution.
/// </summary>
public class DefaultApprovalRequestAssigneeGlobalIdResolver : IApprovalRequestAssigneeGlobalIdResolver
{
    public Task<ApprovalRequestAssigneeGlobalIdMaps> ResolveAsync(
        ApprovalRequest approvalRequest,
        CancellationToken cancellationToken) =>
        Task.FromResult(ApprovalRequestAssigneeGlobalIdMaps.Empty);
}
