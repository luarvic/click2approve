using Click2Approve.Application.Abstractions.Authorization;
using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Application.Abstractions.TenantContext;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for user files.
/// </summary>
public class UserFileRepository(
    ApiDbContext db,
    ITenantContext tenantContext,
    IAccessScopeProvider accessScopeProvider,
    IAccessPolicy accessPolicy) : IUserFileRepository
{
    protected readonly ApiDbContext Db = db;
    protected readonly ITenantContext TenantContext = tenantContext;
    protected readonly IAccessScopeProvider AccessScopeProvider = accessScopeProvider;
    protected readonly IAccessPolicy AccessPolicy = accessPolicy;

    public async Task<UserFile> AddAsync(UserFile userFile, CancellationToken cancellationToken)
    {
        var entry = await Db.UserFiles.AddAsync(userFile, cancellationToken);
        return entry.Entity;
    }

    public async Task<UserFile?> GetPublicAsync(long id, CancellationToken cancellationToken)
    {
        return await Db.UserFiles.FirstOrDefaultAsync(
            file => file.Id == id && file.StorageType == UserFileStorageType.Public,
            cancellationToken);
    }

    public virtual Task<UserFile?> GetForDownloadAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        return GetForDownloadCoreAsync(user, globalId, cancellationToken);
    }

    public virtual async Task<UserFile?> GetForDeleteAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.UserFiles
            .Include(file => file.Owner)
            .Include(f => f.ApprovalRequestFiles)
                .ThenInclude(requestFile => requestFile.ApprovalRequest)
                    .ThenInclude(request => request.Steps)
                        .ThenInclude(step => step.Tasks)
            .FirstOrDefaultAsync(f => f.TenantId == tenantId && f.GlobalId == globalId && f.OwnerId == user.Id, cancellationToken);
    }

    public virtual async Task<UserFile?> GetApprovalRequestAttachmentForDownloadAsync(AppUser user, Guid globalId, Guid approvalRequestGlobalId, CancellationToken cancellationToken)
    {
        var scope = await AccessScopeProvider.GetAsync(user, cancellationToken);
        var visibleRequests = Db.ApprovalRequests.Where(AccessPolicy.CanManageRequest(scope));
        return await Db.UserFiles
            .Include(file => file.Owner)
            .FirstOrDefaultAsync(file => file.GlobalId == globalId
                && file.ApprovalRequestFiles.Any(requestFile => requestFile.ApprovalRequest.GlobalId == approvalRequestGlobalId
                    && visibleRequests.Any(request => request.Id == requestFile.ApprovalRequestId)), cancellationToken);
    }

    public virtual async Task<UserFile?> GetApprovalRequestAttachmentForTaskDownloadAsync(
        AppUser user,
        Guid globalId,
        Guid approvalRequestTaskGlobalId,
        CancellationToken cancellationToken)
    {
        var scope = await AccessScopeProvider.GetAsync(user, cancellationToken);
        var availableTasks = Db.ApprovalRequestTasks.Where(AccessPolicy.CanWorkTask(scope));
        return await Db.UserFiles
            .Include(file => file.Owner)
            .FirstOrDefaultAsync(file => file.GlobalId == globalId
                && file.ApprovalRequestFiles.Any(requestFile => requestFile.ApprovalRequest.Steps.Any(step => step.Tasks.Any(task =>
                    task.GlobalId == approvalRequestTaskGlobalId
                    && availableTasks.Any(availableTask => availableTask.Id == task.Id)))), cancellationToken);
    }

    public virtual Task<UserFile?> GetApprovalRequestTaskAttachmentForDownloadAsync(
        AppUser user,
        Guid globalId,
        Guid approvalRequestTaskGlobalId,
        CancellationToken cancellationToken) =>
        Task.FromResult<UserFile?>(null);

    public virtual Task<UserFile?> GetDiscussionMessageAttachmentForDownloadAsync(
        AppUser user,
        Guid globalId,
        Guid discussionMessageGlobalId,
        CancellationToken cancellationToken) =>
        Task.FromResult<UserFile?>(null);

    public virtual async Task<IList<UserFile>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.UserFiles
            .Where(f => f.TenantId == tenantId && f.OwnerId == user.Id)
            .ToListAsync(cancellationToken);
    }

    public virtual async Task<List<UserFile>> ListAsync(AppUser user, IReadOnlyCollection<Guid> globalIds, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.UserFiles
            .Where(f => f.TenantId == tenantId && globalIds.Contains(f.GlobalId) && f.OwnerId == user.Id)
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

    private async Task<UserFile?> GetForDownloadCoreAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.UserFiles
            .Include(f => f.Owner)
            .FirstOrDefaultAsync(f => f.GlobalId == globalId && f.TenantId == tenantId && f.OwnerId == user.Id, cancellationToken);
    }
}
