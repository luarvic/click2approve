using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.ApprovalRequests;

/// <summary>
/// Defines approval request task operations.
/// </summary>
public interface IApprovalRequestTaskService
{
    Task<List<ApprovalRequestTaskListItemResult>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task<ApprovalRequestTaskDetailsResult> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task CompleteAsync(AppUser user, CompleteApprovalRequestTaskCommand payload, CancellationToken cancellationToken);
    Task<long> CountUncompletedAsync(AppUser user, CancellationToken cancellationToken);
}
