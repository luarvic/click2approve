using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Persistence;

/// <summary>
/// Defines persistence operations for approval requests.
/// </summary>
public interface IApprovalRequestRepository
{
    Task<ApprovalRequest> AddAsync(ApprovalRequest approvalRequest, CancellationToken cancellationToken);
    Task<ApprovalRequest> GetForUpdateAsync(AppUser user, long id, CancellationToken cancellationToken);
    Task<ApprovalRequest> GetAsync(AppUser user, long id, CancellationToken cancellationToken);
    Task<IList<ApprovalRequest>> ListAsync(AppUser user, long userFileId, CancellationToken cancellationToken);
    Task<List<ApprovalRequest>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task<int> CountAsync(AppUser user, DateTime start, DateTime end, CancellationToken cancellationToken);
}
