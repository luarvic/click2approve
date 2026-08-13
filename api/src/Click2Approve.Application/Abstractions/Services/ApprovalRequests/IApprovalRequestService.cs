using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.ApprovalRequests;

/// <summary>
/// Defines approval request owner operations.
/// </summary>
public interface IApprovalRequestService
{
    Task<Guid> SubmitAsync(AppUser user, SubmitApprovalRequestCommand payload, CancellationToken cancellationToken);
    Task CancelAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<List<ApprovalRequestListItemResult>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task<ApprovalRequestDetailsResult> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
}
