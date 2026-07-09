using Click2Approve.Application.Persistence;
using Click2Approve.Application.Services.TenantContext;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for user files.
/// </summary>
public class UserFileRepository(ApiDbContext db, ITenantContext tenantContext) : IUserFileRepository
{
    private readonly ApiDbContext _db = db;
    private readonly ITenantContext _tenantContext = tenantContext;

    public async Task<UserFile> AddAsync(UserFile userFile, CancellationToken cancellationToken)
    {
        var entry = await _db.UserFiles.AddAsync(userFile, cancellationToken);
        return entry.Entity;
    }

    public Task<UserFile> GetForDownloadAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        return GetForDownloadCoreAsync(user, id, cancellationToken);
    }

    public async Task<UserFile> GetForDeleteAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.UserFiles
            .Include(f => f.ApprovalRequests)
            .ThenInclude(r => r.Tasks)
            .FirstAsync(f => f.TenantId == tenantId && f.Id == id && f.OwnerId == user.Id, cancellationToken);
    }

    public async Task<IList<UserFile>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.UserFiles
            .Where(f => f.TenantId == tenantId && f.OwnerId == user.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<UserFile>> ListAsync(AppUser user, IReadOnlyCollection<long> ids, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.UserFiles
            .Where(f => f.TenantId == tenantId && ids.Contains(f.Id) && f.OwnerId == user.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.UserFiles.CountAsync(f => f.TenantId == tenantId && f.OwnerId == user.Id, cancellationToken);
    }

    public void Remove(UserFile userFile)
    {
        _db.UserFiles.Remove(userFile);
    }

    private async Task<UserFile> GetForDownloadCoreAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.UserFiles
            .Include(f => f.Owner)
            .FirstAsync(f => f.Id == id
                && ((f.TenantId == tenantId && f.OwnerId == user.Id)
                    || f.ApprovalRequests.Any(r => r.Tasks.Any(t => t.TenantId == tenantId
                        && t.ApproverUserId == user.Id))),
                cancellationToken);
    }
}
