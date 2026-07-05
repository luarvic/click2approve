using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Persistence;

/// <summary>
/// Defines persistence operations for approval requests.
/// </summary>
public interface IApprovalRequestRepository
{
    Task<ApprovalRequest> AddAsync(ApprovalRequest approvalRequest, CancellationToken cancellationToken);
    Task<ApprovalRequest> GetForDeleteAsync(AppUser user, long id, CancellationToken cancellationToken);
    Task<IList<ApprovalRequest>> ListByUserFileIdAsync(AppUser user, long userFileId, CancellationToken cancellationToken);
    Task<List<ApprovalRequest>> ListByAuthorAsync(AppUser user, CancellationToken cancellationToken);
    Task<int> CountSubmittedByAuthorAsync(AppUser user, DateTime utcStart, DateTime utcEnd, CancellationToken cancellationToken);
    void Remove(ApprovalRequest approvalRequest);
}
