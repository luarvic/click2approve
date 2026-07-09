using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Persistence;

/// <summary>
/// Defines persistence operations for approval request tasks.
/// </summary>
public interface IApprovalRequestTaskRepository
{
    Task<ApprovalRequestTask> AddAsync(ApprovalRequestTask approvalRequestTask, CancellationToken cancellationToken);
    Task<int> ClaimEmailTasksAsync(AppUser user, long personalTenantId, CancellationToken cancellationToken);
    Task<List<ApprovalRequestTask>> ListAsync(AppUser user, ApprovalRequestTaskStatus[] statuses, CancellationToken cancellationToken);
    Task<ApprovalRequestTask> GetForCompletionAsync(AppUser user, long id, CancellationToken cancellationToken);
    Task<long> CountUncompletedAsync(AppUser user, CancellationToken cancellationToken);
    void Remove(ApprovalRequestTask approvalRequestTask);
}
