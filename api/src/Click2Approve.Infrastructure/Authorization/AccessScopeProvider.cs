using Click2Approve.Application.Abstractions.Authorization;
using Click2Approve.Application.Abstractions.TenantContext;
using Click2Approve.Application.Models.Authorization;
using Click2Approve.Domain.Models;

namespace Click2Approve.Infrastructure.Authorization;

/// <summary>
/// Resolves the tenant scope for the current request.
/// </summary>
public class AccessScopeProvider(ITenantContext tenantContext) : IAccessScopeProvider
{
    private readonly ITenantContext _tenantContext = tenantContext;

    public async Task<AccessScope> GetAsync(AppUser user, CancellationToken cancellationToken) =>
        new(await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken), user.Id);
}
