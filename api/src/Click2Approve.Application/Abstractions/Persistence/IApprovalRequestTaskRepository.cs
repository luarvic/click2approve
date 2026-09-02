using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Persistence;

/// <summary>
/// Defines persistence operations for approval request tasks.
/// </summary>
public interface IApprovalRequestTaskRepository
{
    Task<ApprovalRequestTask> AddAsync(ApprovalRequestTask approvalRequestTask, CancellationToken cancellationToken);
    Task<int> ClaimEmailTasksAsync(AppUser user, long personalTenantId, CancellationToken cancellationToken);
    Task<GridPageResult<ApprovalRequestTaskListItemResult>> ListAsync(
        AppUser user,
        ApprovalRequestTaskListQueryCommand query,
        CancellationToken cancellationToken);
    Task<ApprovalRequestTaskDetailsResult?> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<ApprovalRequestTask?> GetForCompletionAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<bool> HasAttachmentsAsync(ApprovalRequestTask task, CancellationToken cancellationToken);
    Task<long> CountUncompletedAsync(AppUser user, CancellationToken cancellationToken);
}
