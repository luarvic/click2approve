using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.Tenants;

/// <summary>
/// Defines tenant business operations.
/// </summary>
public interface ITenantService
{
    Task<Tenant> CreateDefaultForUserAsync(AppUser user, CancellationToken cancellationToken);
    Task<Tenant> GetRequiredDefaultForUserAsync(AppUser user, CancellationToken cancellationToken);
}
