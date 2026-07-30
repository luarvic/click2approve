using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Defines approval request task operations.
/// </summary>
public interface IApprovalRequestTaskService
{
    Task<List<ApprovalRequestTaskListItemDto>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task<ApprovalRequestTaskDetailDto> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task CompleteAsync(AppUser user, ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken);
    Task<long> CountUncompletedAsync(AppUser user, CancellationToken cancellationToken);
}
