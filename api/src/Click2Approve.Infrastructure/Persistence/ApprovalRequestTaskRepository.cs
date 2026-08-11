using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Application.Abstractions.TenantContext;
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
        var tasks = await Db.ApprovalRequestTasks
            .Where(t => t.AssigneeUserId == user.Id && t.TenantId != personalTenantId)
            .ToListAsync(cancellationToken);

        foreach (var task in tasks)
        {
            task.TenantId = personalTenantId;
        }

        return tasks.Count;
    }

    public virtual async Task<List<ApprovalRequestTask>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequestTasks
            .AsNoTracking()
            .Include(task => task.AssigneeUser)
            .Include(task => task.CompletedByUser)
            .Include(task => task.ApprovalRequest)
                .ThenInclude(request => request.CreatedByUser)
            .Where(t => t.AssigneeUserId == user.Id
                && t.TenantId == tenantId)
            .ToListAsync(cancellationToken);
    }

    public virtual async Task<ApprovalRequestTask?> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequestTasks
            .AsNoTracking()
            .Include(task => task.AssigneeUser)
            .Include(task => task.CompletedByUser)
            .Include(task => task.ApprovalRequestStep)
            .Include(task => task.ApprovalRequestStepAssignee)
                .ThenInclude(assignee => assignee!.User)
            .Include(task => task.ApprovalRequest)
                .ThenInclude(request => request.CreatedByUser)
            .Include(task => task.ApprovalRequest)
                .ThenInclude(request => request.RequestFiles)
                    .ThenInclude(file => file.UserFile)
            .FirstOrDefaultAsync(task => task.GlobalId == globalId
                && task.AssigneeUserId == user.Id
                && task.TenantId == tenantId,
                cancellationToken);
    }

    public virtual async Task<ApprovalRequest?> GetRequestForTaskAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequests
            .AsNoTracking()
            .Include(request => request.CreatedByUser)
            .Include(request => request.CompletedByUser)
            .Include(request => request.NextRevisionApprovalRequest)
                .ThenInclude(nextRevision => nextRevision!.CreatedByUser)
            .Include(request => request.RequestFiles)
                .ThenInclude(file => file.UserFile)
            .Include(request => request.Steps)
                .ThenInclude(step => step.Assignees)
                    .ThenInclude(assignee => assignee.User)
            .Include(request => request.Steps)
                .ThenInclude(step => step.StepVisibilities)
                    .ThenInclude(visibility => visibility.ApprovalRequestStepAssignee)
                        .ThenInclude(assignee => assignee!.User)
            .Include(request => request.Steps)
                .ThenInclude(step => step.StepVisibilities)
            .Include(request => request.Steps)
                .ThenInclude(step => step.Tasks)
                    .ThenInclude(requestTask => requestTask.ApprovalRequestStepAssignee)
                        .ThenInclude(assignee => assignee!.User)
            .Include(request => request.Steps)
                .ThenInclude(step => step.Tasks)
                    .ThenInclude(requestTask => requestTask.AssigneeUser)
            .Include(request => request.Steps)
                .ThenInclude(step => step.Tasks)
                    .ThenInclude(requestTask => requestTask.CompletedByUser)
            .FirstOrDefaultAsync(request => request.Steps.Any(step => step.Tasks.Any(task => task.GlobalId == globalId
                && task.AssigneeUserId == user.Id
                && task.TenantId == tenantId)),
                cancellationToken);
    }

    public virtual async Task<ApprovalRequestTask?> GetForCompletionAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequestTasks
            .Include(t => t.ApprovalRequest)
                .ThenInclude(r => r.CreatedByUser)
            .Include(t => t.ApprovalRequest)
                .ThenInclude(r => r.RequestFiles)
                    .ThenInclude(file => file.UserFile)
            .Include(t => t.ApprovalRequestStep)
                .ThenInclude(s => s.Tasks)
            .Include(t => t.ApprovalRequestStepAssignee)
                .ThenInclude(assignee => assignee!.User)
            .Include(t => t.ApprovalRequest.Steps)
                .ThenInclude(s => s.Assignees)
                    .ThenInclude(assignee => assignee.User)
            .Include(t => t.ApprovalRequest.Steps)
                .ThenInclude(s => s.StepVisibilities)
                    .ThenInclude(visibility => visibility.ApprovalRequestStepAssignee)
                        .ThenInclude(assignee => assignee!.User)
            .Include(t => t.ApprovalRequest.Steps)
                .ThenInclude(s => s.Tasks)
                    .ThenInclude(task => task.ApprovalRequestStepAssignee)
                        .ThenInclude(assignee => assignee!.User)
            .Include(t => t.ApprovalRequest.Steps)
                .ThenInclude(s => s.Tasks)
                    .ThenInclude(task => task.AssigneeUser)
            .Include(t => t.ApprovalRequest.Steps)
                .ThenInclude(s => s.Tasks)
                    .ThenInclude(task => task.CompletedByUser)
            .Include(t => t.AssigneeUser)
            .Include(t => t.CompletedByUser)
                .FirstOrDefaultAsync(t => t.GlobalId == globalId
                    && t.AssigneeUserId == user.Id
                    && t.TenantId == tenantId,
                    cancellationToken);
    }

    public virtual async Task<long> CountUncompletedAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await TenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await Db.ApprovalRequestTasks
            .Where(t => t.AssigneeUserId == user.Id
                && t.Status == ApprovalRequestTaskStatus.Pending
                && t.TenantId == tenantId)
            .LongCountAsync(cancellationToken);
    }

}
