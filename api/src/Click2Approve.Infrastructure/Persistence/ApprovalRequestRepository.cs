using Click2Approve.Application.Persistence;
using Click2Approve.Application.Services.TenantContext;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for approval requests.
/// </summary>
public class ApprovalRequestRepository(ApiDbContext db, ITenantContext tenantContext) : IApprovalRequestRepository
{
    protected readonly ApiDbContext Db = db;
    protected readonly ITenantContext TenantContext = tenantContext;

    public virtual async Task<ApprovalRequest> AddAsync(ApprovalRequest approvalRequest, CancellationToken cancellationToken)
    {
        var entry = await Db.ApprovalRequests.AddAsync(approvalRequest, cancellationToken);
        return entry.Entity;
    }

    public virtual async Task<ApprovalRequest> GetForUpdateAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await IncludeDetails(Db.ApprovalRequests)
            .FirstAsync(r => r.TenantId == tenantId && r.Id == id && r.CreatedByUserId == user.Id, cancellationToken);
    }

    public virtual async Task<ApprovalRequest> GetAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await IncludeDetails(Db.ApprovalRequests)
            .AsNoTracking()
            .FirstAsync(r => r.Id == id
                && ((r.TenantId == tenantId && r.CreatedByUserId == user.Id)
                    || r.Tasks.Any(task => task.ApproverUserId == user.Id
                    && task.TenantId == tenantId
                    && task.CanViewRequest)), cancellationToken);
    }

    public async Task<IList<ApprovalRequest>> ListAsync(AppUser user, long userFileId, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequests
            .Where(r => r.TenantId == tenantId && r.UserFiles.Any(f => f.Id == userFileId))
            .ToListAsync(cancellationToken);
    }

    public virtual async Task<List<ApprovalRequest>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequests
            .AsNoTracking()
            .Where(r => r.TenantId == tenantId && r.CreatedByUserId == user.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountAsync(AppUser user, DateTime start, DateTime end, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequests.CountAsync(r => r.TenantId == tenantId
            && r.CreatedByUserId == user.Id
            && r.CreatedAt >= start
            && r.CreatedAt < end, cancellationToken);
    }

    protected static IQueryable<ApprovalRequest> IncludeDetails(IQueryable<ApprovalRequest> requests) => requests
        .Include(request => request.UserFiles)
        .Include(request => request.LogEntries)
        .Include(request => request.Tasks)
            .ThenInclude(task => task.LogEntries)
        .Include(request => request.Steps)
            .ThenInclude(step => step.Approvers)
        .Include(request => request.Steps)
            .ThenInclude(step => step.Tasks);
}
