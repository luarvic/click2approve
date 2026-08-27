using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Persistence;

/// <summary>
/// Defines persistence operations for approval requests.
/// </summary>
public interface IApprovalRequestRepository
{
    Task<ApprovalRequest> AddAsync(ApprovalRequest approvalRequest, CancellationToken cancellationToken);
    Task<ApprovalRequest?> GetForUpdateAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<ApprovalRequest?> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<List<ApprovalRequestListItemResult>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task<int> CountAsync(AppUser user, DateTime start, DateTime end, CancellationToken cancellationToken);
    Task RemoveAsync(ApprovalRequest approvalRequest, CancellationToken cancellationToken);
}
