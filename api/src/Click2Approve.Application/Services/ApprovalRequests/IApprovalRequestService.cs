using Click2Approve.Domain.Models;
using Click2Approve.Application.Models.DTOs;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Defines a contract for a service that manages approval requests and approval request tasks.
/// </summary>
public interface IApprovalRequestService
{
    Task<Guid> SubmitApprovalRequestAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken);
    Task CancelApprovalRequestAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<List<ApprovalRequestListItemDto>> ListApprovalRequestsAsync(AppUser user, CancellationToken cancellationToken);
    Task<ApprovalRequestDto> GetApprovalRequestAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<List<ApprovalRequestTaskListItemDto>> ListTasksAsync(AppUser user, CancellationToken cancellationToken);
    Task<ApprovalRequestTaskDetailDto> GetTaskAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task CompleteTaskAsync(AppUser user, ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken);
    Task<long> CountUncompletedTasksAsync(AppUser user, CancellationToken cancellationToken);
}
