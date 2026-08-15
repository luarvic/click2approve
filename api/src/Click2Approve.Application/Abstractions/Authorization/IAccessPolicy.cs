using Click2Approve.Application.Models.Authorization;
using Click2Approve.Domain.Models;
using System.Linq.Expressions;

namespace Click2Approve.Application.Abstractions.Authorization;

/// <summary>
/// Defines queryable authorization policies for application resources.
/// </summary>
public interface IAccessPolicy
{
    Expression<Func<ApprovalRequest, bool>> CanManageRequest(AccessScope scope);
    Expression<Func<ApprovalRequestTask, bool>> CanWorkTask(AccessScope scope);
    Expression<Func<ApprovalRequestTask, bool>> CanViewTaskAttachments(AccessScope scope);
}
