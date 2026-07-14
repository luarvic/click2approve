using Click2Approve.Application.Persistence;
using Click2Approve.Application.Services.TenantContext;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for approval request tasks.
/// </summary>
public class ApprovalRequestTaskRepository(ApiDbContext db, ITenantContext tenantContext) : IApprovalRequestTaskRepository
{
    private readonly ApiDbContext _db = db;
    private readonly ITenantContext _tenantContext = tenantContext;

    public async Task<ApprovalRequestTask> AddAsync(ApprovalRequestTask approvalRequestTask, CancellationToken cancellationToken)
    {
        var entry = await _db.ApprovalRequestTasks.AddAsync(approvalRequestTask, cancellationToken);
        return entry.Entity;
    }

    public async Task<int> ClaimEmailTasksAsync(AppUser user, long personalTenantId, CancellationToken cancellationToken)
    {
        if (user.NormalizedEmail is null)
        {
            return 0;
        }

        var tasks = await _db.ApprovalRequestTasks
            .Where(t => t.ApproverUserId == null && t.ApproverEmail == user.NormalizedEmail)
            .ToListAsync(cancellationToken);

        foreach (var task in tasks)
        {
            task.ApproverUserId = user.Id;
            task.TenantId = personalTenantId;
        }

        return tasks.Count;
    }

    public async Task<List<ApprovalRequestTask>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.ApprovalRequestTasks
            .AsNoTracking()
            .Where(t => t.ApproverUserId == user.Id
                && t.TenantId == tenantId)
            .ToListAsync(cancellationToken);
    }

    public async Task<ApprovalRequestTask> GetAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.ApprovalRequestTasks
            .AsNoTracking()
            .Include(task => task.UserFiles)
            .Include(task => task.ApprovalRequest)
            .FirstAsync(task => task.Id == id
                && task.ApproverUserId == user.Id
                && task.TenantId == tenantId,
                cancellationToken);
    }

    public async Task<ApprovalRequestTask> GetForCompletionAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.ApprovalRequestTasks
            .Include(t => t.ApprovalRequest)
            .Include(t => t.UserFiles)
            .Include(t => t.ApprovalRequest.Tasks)
            .Include(t => t.ApprovalRequestStep)
                .ThenInclude(s => s.Tasks)
            .Include(t => t.ApprovalRequest.Steps)
                .ThenInclude(s => s.Approvers)
            .Include(t => t.ApprovalRequest.Steps)
                .ThenInclude(s => s.Tasks)
            .FirstAsync(t => t.Id == id
                && t.ApproverUserId == user.Id
                && t.TenantId == tenantId,
                cancellationToken);
    }

    public async Task<long> CountUncompletedAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.ApprovalRequestTasks
            .Where(t => t.ApproverUserId == user.Id
                && t.Status == ApprovalRequestTaskStatus.Pending
                && t.TenantId == tenantId)
            .LongCountAsync(cancellationToken);
    }

    public void Remove(ApprovalRequestTask approvalRequestTask)
    {
        _db.ApprovalRequestTasks.Remove(approvalRequestTask);
    }
}
