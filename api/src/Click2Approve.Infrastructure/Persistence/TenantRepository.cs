using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for tenants.
/// </summary>
public class TenantRepository(ApiDbContext db) : ITenantRepository
{
    protected readonly ApiDbContext Db = db;

    public async Task<Tenant> AddAsync(Tenant tenant, CancellationToken cancellationToken)
    {
        var entry = await Db.Tenants.AddAsync(tenant, cancellationToken);
        return entry.Entity;
    }

    public virtual Task<Tenant?> GetAsync(long id, CancellationToken cancellationToken)
    {
        return Db.Tenants
            .Include(t => t.Owner)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public virtual Task<Tenant?> GetPersonalAsync(AppUser user, CancellationToken cancellationToken)
    {
        return Db.Tenants
            .Include(t => t.Owner)
            .Where(t => t.Owner == user && t.Type == TenantType.Personal)
            .OrderBy(t => t.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public virtual Task<Tenant?> GetPersonalAsync(string normalizedEmail, CancellationToken cancellationToken)
    {
        return Db.Tenants
            .Include(t => t.Owner)
            .Where(t => t.Owner.NormalizedEmail == normalizedEmail && t.Type == TenantType.Personal)
            .OrderBy(t => t.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public virtual Task<List<Tenant>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        return Db.Tenants
            .Include(t => t.Owner)
            .Where(t => t.Owner == user)
            .OrderBy(t => t.BusinessName)
            .ToListAsync(cancellationToken);
    }

    public void Remove(Tenant tenant)
    {
        Db.Tenants.Remove(tenant);
    }
}
