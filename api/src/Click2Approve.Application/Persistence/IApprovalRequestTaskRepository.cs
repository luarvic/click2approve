using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Persistence;

/// <summary>
/// Defines persistence operations for approval request tasks.
/// </summary>
public interface IApprovalRequestTaskRepository
{
    Task<ApprovalRequestTask> AddAsync(ApprovalRequestTask approvalRequestTask, CancellationToken cancellationToken);
    Task<List<ApprovalRequestTask>> ListByApproverAsync(AppUser user, ApprovalStatus[] statuses, CancellationToken cancellationToken);
    Task<ApprovalRequestTask> GetForCompletionAsync(AppUser user, long id, CancellationToken cancellationToken);
    Task<long> CountUncompletedByApproverAsync(AppUser user, CancellationToken cancellationToken);
}
