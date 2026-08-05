using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Identity;

/// <summary>
/// Provides identity user lookup and update operations.
/// </summary>
public interface IUserIdentityService
{
    Task<AppUser?> FindByIdAsync(string userId, CancellationToken cancellationToken);
    Task UpdateAsync(AppUser user, CancellationToken cancellationToken);
}
