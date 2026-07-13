using Click2Approve.Domain.Models;
using Click2Approve.Application.Models.DTOs;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Defines a contract for a service that manages approval requests and approval request tasks.
/// </summary>
public interface IApprovalRequestService
{
    Task<long> SubmitApprovalRequestAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken);
    Task DeleteApprovalRequestAsync(AppUser user, long id, CancellationToken cancellationToken);
    Task CancelApprovalRequestAsync(AppUser user, long id, CancellationToken cancellationToken);
    Task UpdateApprovalRequestAsync(AppUser user, long id, ApprovalRequestUpdateDto payload, CancellationToken cancellationToken);
    Task<List<ApprovalRequestDto>> ListApprovalRequestsAsync(AppUser user, CancellationToken cancellationToken);
    Task<List<ApprovalRequestTask>> ListTasksAsync(AppUser user, CancellationToken cancellationToken);
    Task CompleteTaskAsync(AppUser user, ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken);
    Task<long> CountUncompletedTasksAsync(AppUser user, CancellationToken cancellationToken);
}
