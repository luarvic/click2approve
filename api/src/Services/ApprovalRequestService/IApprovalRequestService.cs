using api.Models;
using api.Models.DTOs;

namespace api.Services;

// Defines a contract for a service that manages approval requests.
public interface IApprovalRequestService
{
    Task SubmitAsync(AppUser user, ApprovalRequestDto payload, CancellationToken cancellationToken);
    Task<List<ApprovalRequest>> ListAsync(AppUser user, ApprovalRequestStatuses[] statuses, CancellationToken cancellationToken);
    Task<List<ApprovalRequest>> ListSentAsync(AppUser user, CancellationToken cancellationToken);
}
