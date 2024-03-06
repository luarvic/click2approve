using api.Models;
using api.Models.DTOs;

namespace api.Services;

public interface IApprovalRequestService
{
    Task SubmitAsync(AppUser user, ApprovalRequestDto payload, CancellationToken cancellationToken);
}
