using Click2Approve.Domain.Models;
using Click2Approve.Application.Models.Commands.ApprovalRequests;

namespace Click2Approve.Application.Abstractions.Services.ApprovalRequests;

/// <summary>
/// Defines approval request owner operations.
/// </summary>
public interface IApprovalRequestService
{
    Task<Guid> SubmitAsync(AppUser user, SubmitApprovalRequestCommand payload, CancellationToken cancellationToken);
    Task CancelAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task DeleteAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<GridPageResult<ApprovalRequestListItemResult>> ListAsync(
        AppUser user,
        ApprovalRequestListQueryCommand query,
        CancellationToken cancellationToken);
    Task<ApprovalRequestDetailsResult> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
}
