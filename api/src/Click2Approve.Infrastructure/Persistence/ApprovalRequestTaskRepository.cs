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
    protected readonly ApiDbContext Db = db;
    protected readonly ITenantContext TenantContext = tenantContext;

    public virtual async Task<ApprovalRequestTask> AddAsync(ApprovalRequestTask approvalRequestTask, CancellationToken cancellationToken)
    {
        var entry = await Db.ApprovalRequestTasks.AddAsync(approvalRequestTask, cancellationToken);
        return entry.Entity;
    }

    public virtual async Task<int> ClaimEmailTasksAsync(AppUser user, long personalTenantId, CancellationToken cancellationToken)
    {
        if (user.NormalizedEmail is null)
        {
            return 0;
        }

        var tasks = await Db.ApprovalRequestTasks
            .Where(t => t.ApproverUserId == null && t.ApproverEmail == user.NormalizedEmail)
            .ToListAsync(cancellationToken);

        foreach (var task in tasks)
        {
            task.ApproverUserId = user.Id;
            task.TenantId = personalTenantId;
        }

        return tasks.Count;
    }

    public virtual async Task<List<ApprovalRequestTask>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequestTasks
            .AsNoTracking()
            .Include(task => task.ApprovalRequest)
            .Where(t => t.ApproverUserId == user.Id
                && t.TenantId == tenantId)
            .ToListAsync(cancellationToken);
    }

    public virtual async Task<ApprovalRequestTask> GetAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequestTasks
            .AsNoTracking()
            .Include(task => task.LogEntries)
            .Include(task => task.ApprovalRequest)
                .ThenInclude(request => request.UserFiles)
            .FirstAsync(task => task.Id == id
                && task.ApproverUserId == user.Id
                && task.TenantId == tenantId,
                cancellationToken);
    }

    public virtual async Task<ApprovalRequest> GetRequestAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequests
            .AsNoTracking()
            .Include(request => request.UserFiles)
            .Include(request => request.LogEntries)
            .Include(request => request.Steps)
                .ThenInclude(step => step.Approvers)
            .Include(request => request.Steps)
                .ThenInclude(step => step.Tasks)
                    .ThenInclude(requestTask => requestTask.LogEntries)
            .FirstAsync(request => request.Tasks.Any(task => task.Id == id
                && task.ApproverUserId == user.Id
                && task.TenantId == tenantId
                && task.CanViewRequest),
                cancellationToken);
    }

    public virtual async Task<ApprovalRequestTask> GetForCompletionAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequestTasks
            .Include(t => t.ApprovalRequest)
                .ThenInclude(r => r.UserFiles)
            .Include(t => t.LogEntries)
            .Include(t => t.ApprovalRequest.Tasks)
                .ThenInclude(task => task.LogEntries)
            .Include(t => t.ApprovalRequestStep)
                .ThenInclude(s => s.Tasks)
            .Include(t => t.ApprovalRequestStepApprover)
            .Include(t => t.ApprovalRequest.Steps)
                .ThenInclude(s => s.Approvers)
            .Include(t => t.ApprovalRequest.Steps)
                .ThenInclude(s => s.Tasks)
            .FirstAsync(t => t.Id == id
                && t.ApproverUserId == user.Id
                && t.TenantId == tenantId,
                cancellationToken);
    }

    public virtual async Task<long> CountUncompletedAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequestTasks
            .Where(t => t.ApproverUserId == user.Id
                && t.Status == ApprovalRequestTaskStatus.Pending
                && t.TenantId == tenantId)
            .LongCountAsync(cancellationToken);
    }

    public virtual void Remove(ApprovalRequestTask approvalRequestTask)
    {
        Db.ApprovalRequestTasks.Remove(approvalRequestTask);
    }
}
