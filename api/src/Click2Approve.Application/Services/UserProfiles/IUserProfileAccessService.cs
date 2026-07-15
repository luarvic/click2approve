using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.UserProfiles;

/// <summary>
/// Defines authorization checks for user profile settings.
/// </summary>
public interface IUserProfileAccessService
{
    Task<bool> CanUseDefaultTenantAsync(AppUser user, long tenantId, CancellationToken cancellationToken);
}
