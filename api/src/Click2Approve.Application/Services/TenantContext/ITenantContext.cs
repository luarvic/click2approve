using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.TenantContext;

/// <summary>
/// Resolves the tenant scope for the current operation.
/// </summary>
public interface ITenantContext
{
    void SetTenantId(long tenantId);

    Task<long> GetRequiredTenantIdAsync(AppUser user, CancellationToken cancellationToken);
}
