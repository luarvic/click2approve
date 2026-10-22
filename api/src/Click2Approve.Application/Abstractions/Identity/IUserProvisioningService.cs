using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Identity;

/// <summary>
/// Provides user lookup and placeholder provisioning operations.
/// </summary>
public interface IUserProvisioningService
{
    Task<AppUser> EnsureUserAsync(string email, CancellationToken cancellationToken);
}
