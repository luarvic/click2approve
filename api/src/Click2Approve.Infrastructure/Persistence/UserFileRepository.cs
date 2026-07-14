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
    protected readonly ApiDbContext Db = db;
    protected readonly ITenantContext TenantContext = tenantContext;

    public async Task<UserFile> AddAsync(UserFile userFile, CancellationToken cancellationToken)
    {
        var entry = await Db.UserFiles.AddAsync(userFile, cancellationToken);
        return entry.Entity;
    }

    public Task<UserFile> GetForDownloadAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        return GetForDownloadCoreAsync(user, id, cancellationToken);
    }

    public async Task<UserFile> GetForDeleteAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.UserFiles
            .Include(f => f.ApprovalRequests)
            .ThenInclude(r => r.Tasks)
            .FirstAsync(f => f.TenantId == tenantId && f.Id == id && f.OwnerId == user.Id, cancellationToken);
    }

    public virtual async Task<UserFile> GetForApprovalRequestDownloadAsync(AppUser user, long id, long approvalRequestId, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.UserFiles
            .Include(file => file.Owner)
            .FirstAsync(file => file.Id == id
                && file.ApprovalRequests.Any(request => request.Id == approvalRequestId
                    && request.TenantId == tenantId
                    && request.CreatedByUserId == user.Id), cancellationToken);
    }

    public virtual async Task<UserFile> GetForApprovalRequestTaskDownloadAsync(AppUser user, long id, long approvalRequestTaskId, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.UserFiles
            .Include(file => file.Owner)
            .FirstAsync(file => file.Id == id
                && file.ApprovalRequestTasks.Any(task => task.Id == approvalRequestTaskId
                    && task.TenantId == tenantId
                    && task.ApproverUserId == user.Id), cancellationToken);
    }

    public async Task<IList<UserFile>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.UserFiles
            .Where(f => f.TenantId == tenantId && f.OwnerId == user.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<UserFile>> ListAsync(AppUser user, IReadOnlyCollection<long> ids, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.UserFiles
            .Where(f => f.TenantId == tenantId && ids.Contains(f.Id) && f.OwnerId == user.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.UserFiles.CountAsync(f => f.TenantId == tenantId && f.OwnerId == user.Id, cancellationToken);
    }

    public void Remove(UserFile userFile)
    {
        Db.UserFiles.Remove(userFile);
    }

    private async Task<UserFile> GetForDownloadCoreAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.UserFiles
            .Include(f => f.Owner)
            .FirstAsync(f => f.Id == id && f.TenantId == tenantId && f.OwnerId == user.Id, cancellationToken);
    }
}
