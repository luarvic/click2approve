using Click2Approve.Application.Services.TenantContext;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Services.TenantContext;

/// <summary>
/// Stores the validated tenant scope for the current request.
/// </summary>
public class RequestTenantContext : ITenantContext
{
    private long? _tenantId;

    public void SetTenantId(long tenantId)
    {
        _tenantId = tenantId;
    }

    public Task<long> GetRequiredTenantIdAsync(AppUser user, CancellationToken cancellationToken)
    {
        return Task.FromResult(_tenantId ?? throw new TenantRequiredException());
    }
}
