using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Persistence;

/// <summary>
/// Defines persistence operations for tenants.
/// </summary>
public interface ITenantRepository
{
    Task<Tenant> AddAsync(Tenant tenant, CancellationToken cancellationToken);
    Task<Tenant?> GetAsync(long id, CancellationToken cancellationToken);
    Task<Tenant?> GetPersonalAsync(AppUser user, CancellationToken cancellationToken);
    Task<Tenant?> GetPersonalAsync(string normalizedEmail, CancellationToken cancellationToken);
    Task<List<Tenant>> ListAsync(AppUser user, CancellationToken cancellationToken);
    void Remove(Tenant tenant);
}
