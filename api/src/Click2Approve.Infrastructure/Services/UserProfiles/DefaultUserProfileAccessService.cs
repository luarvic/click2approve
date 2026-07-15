using Click2Approve.Application.Persistence;
using Click2Approve.Application.Services.UserProfiles;
using Click2Approve.Domain.Models;

namespace Click2Approve.Infrastructure.Services.UserProfiles;

/// <summary>
/// Implements profile setting access checks for the public application.
/// </summary>
public class DefaultUserProfileAccessService(ITenantRepository tenantRepository) : IUserProfileAccessService
{
    private readonly ITenantRepository _tenantRepository = tenantRepository;

    public async Task<bool> CanUseDefaultTenantAsync(AppUser user, long tenantId, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetAsync(tenantId, cancellationToken);
        return tenant?.Owner.Id == user.Id;
    }
}
