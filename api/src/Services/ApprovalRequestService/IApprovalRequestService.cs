using api.Models;
using api.Models.DTOs;

namespace api.Services;

// Defines a contract for a service that manages approval requests.
public interface IApprovalRequestService
{
    Task SubmitAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken);
    Task HandleAsync(AppUser user, ApprovalRequestHandleDto payload, CancellationToken cancellationToken);
    Task<List<ApprovalRequest>> ListIncomingAsync(AppUser user, ApprovalRequestStatuses[] statuses, CancellationToken cancellationToken);
    Task<List<ApprovalRequest>> ListOutgoingAsync(AppUser user, CancellationToken cancellationToken);
    Task<long> CountIncomingAsync(AppUser user, ApprovalRequestStatuses[] statuses, CancellationToken cancellationToken);
}
