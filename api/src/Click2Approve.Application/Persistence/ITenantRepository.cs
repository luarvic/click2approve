using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Persistence;

/// <summary>
/// Defines persistence operations for tenants.
/// </summary>
public interface ITenantRepository
{
    Task<Tenant> AddAsync(Tenant tenant, CancellationToken cancellationToken);
    Task<Tenant?> GetByIdAsync(long id, CancellationToken cancellationToken);
    Task<Tenant?> GetDefaultForUserAsync(AppUser user, CancellationToken cancellationToken);
    Task<Tenant?> GetDefaultForUserEmailAsync(string normalizedEmail, CancellationToken cancellationToken);
    Task<List<Tenant>> ListForUserAsync(AppUser user, CancellationToken cancellationToken);
    void Remove(Tenant tenant);
}
