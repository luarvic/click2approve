using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.Identity;

/// <summary>
/// Provides user lookup and placeholder provisioning operations.
/// </summary>
public interface IUserProvisioningService
{
    Task<AppUser> EnsureUserAsync(string email, CancellationToken cancellationToken);
}
