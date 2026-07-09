using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.Tenants;

/// <summary>
/// Defines tenant business operations.
/// </summary>
public interface ITenantService
{
    Task<Tenant> CreateDefaultAsync(AppUser user, CancellationToken cancellationToken);
    Task<Tenant> GetRequiredDefaultAsync(AppUser user, CancellationToken cancellationToken);
    Task InitializeUserAsync(AppUser user, CancellationToken cancellationToken);
}
