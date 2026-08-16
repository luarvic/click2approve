using System.Linq.Expressions;
using Click2Approve.Application.Abstractions.Authorization;
using Click2Approve.Application.Models.Authorization;
using Click2Approve.Domain.Models;

namespace Click2Approve.Infrastructure.Authorization;

/// <summary>
/// Defines the default requester and assignee access policies.
/// </summary>
public class DefaultAccessPolicy : IAccessPolicy
{
    public virtual Expression<Func<ApprovalRequest, bool>> CanManageRequest(AccessScope scope) =>
        request => request.TenantId == scope.TenantId && request.CreatedByUserId == scope.UserId;

    public virtual Expression<Func<ApprovalRequestTask, bool>> CanWorkTask(AccessScope scope) =>
        task => task.TenantId == scope.TenantId && task.AssigneeUserId == scope.UserId;

    public virtual Expression<Func<ApprovalRequestTask, bool>> CanViewTaskAttachments(AccessScope scope) =>
        task => task.TenantId == scope.TenantId
            && (task.AssigneeUserId == scope.UserId || task.ApprovalRequest.CreatedByUserId == scope.UserId);
}
