using api.Models;
using api.Models.DTOs;

namespace api.Services;

// Defines a contract for a service that manages approval requests and derived tasks.
public interface IApprovalRequestService
{
    Task SubmitApprovalRequestAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken);
    Task<List<ApprovalRequest>> ListApprovalRequestsAsync(AppUser user, CancellationToken cancellationToken);
    Task<List<ApprovalRequestTask>> ListTasksAsync(AppUser user, ApprovalStatus[] statuses, CancellationToken cancellationToken);
    Task CompleteTaskAsync(AppUser user, ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken);
    Task<long> CountUncompletedTasksAsync(AppUser user, CancellationToken cancellationToken);
}
