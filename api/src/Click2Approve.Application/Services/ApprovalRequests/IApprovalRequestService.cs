using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Defines approval request owner operations.
/// </summary>
public interface IApprovalRequestService
{
    Task<Guid> SubmitAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken);
    Task CancelAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<List<ApprovalRequestListItemDto>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task<ApprovalRequestDto> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
}
