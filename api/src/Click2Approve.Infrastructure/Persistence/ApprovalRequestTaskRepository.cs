using Click2Approve.Application.Abstractions.Authorization;
using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Application.Abstractions.Services.ApprovalRequests;
using Click2Approve.Application.Abstractions.TenantContext;
using Click2Approve.Application.Models.Results.ApprovalRequests;
using Click2Approve.Application.Services.ApprovalRequests;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for approval request tasks.
/// </summary>
public class ApprovalRequestTaskRepository(
    ApiDbContext db,
    ITenantContext tenantContext,
    IAccessScopeProvider accessScopeProvider,
    IAccessPolicy accessPolicy,
    IApprovalRequestAssigneeGlobalIdResolver assigneeGlobalIdResolver) : IApprovalRequestTaskRepository
{
    protected readonly ApiDbContext Db = db;
    protected readonly ITenantContext TenantContext = tenantContext;
    protected readonly IAccessScopeProvider AccessScopeProvider = accessScopeProvider;
    protected readonly IAccessPolicy AccessPolicy = accessPolicy;
    protected readonly IApprovalRequestAssigneeGlobalIdResolver AssigneeGlobalIdResolver = assigneeGlobalIdResolver;

    public virtual async Task<ApprovalRequestTask> AddAsync(ApprovalRequestTask approvalRequestTask, CancellationToken cancellationToken)
    {
        var entry = await Db.ApprovalRequestTasks.AddAsync(approvalRequestTask, cancellationToken);
        return entry.Entity;
    }

    public virtual async Task<int> ClaimEmailTasksAsync(AppUser user, long personalTenantId, CancellationToken cancellationToken)
    {
        var tasks = await Db.ApprovalRequestTasks
            .Where(task => task.AssigneeUserId == user.Id
                && !task.AssigneeEmployeeId.HasValue
                && task.TenantId != personalTenantId)
            .ToListAsync(cancellationToken);

        foreach (var task in tasks)
        {
            task.TenantId = personalTenantId;
        }

        return tasks.Count;
    }

    public virtual async Task<List<ApprovalRequestTask>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var scope = await AccessScopeProvider.GetAsync(user, cancellationToken);
        return await Db.ApprovalRequestTasks
            .AsNoTracking()
            .Include(task => task.AssigneeUser)
            .Include(task => task.CompletedByUser)
            .Include(task => task.ApprovalRequest)
                .ThenInclude(request => request.CreatedByUser)
            .Where(AccessPolicy.CanWorkTask(scope))
            .ToListAsync(cancellationToken);
    }

    public virtual async Task<ApprovalRequestTaskDetailsResult?> GetAsync(
        AppUser user,
        Guid globalId,
        CancellationToken cancellationToken)
    {
        var task = await GetTaskAsync(user, globalId, cancellationToken);
        return task is null
            ? null
            : await GetRequestForTaskAsync(task, cancellationToken);
    }

    public virtual async Task<ApprovalRequestTask?> GetForCompletionAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var scope = await AccessScopeProvider.GetAsync(user, cancellationToken);
        return await Db.ApprovalRequestTasks
            .AsSplitQuery()
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
            .Where(AccessPolicy.CanWorkTask(scope))
            .FirstOrDefaultAsync(t => t.GlobalId == globalId,
                cancellationToken);
    }

    public virtual async Task<long> CountUncompletedAsync(AppUser user, CancellationToken cancellationToken)
    {
        var scope = await AccessScopeProvider.GetAsync(user, cancellationToken);
        return await Db.ApprovalRequestTasks
            .Where(AccessPolicy.CanWorkTask(scope))
            .Where(t => t.Status == ApprovalRequestTaskStatus.Pending)
            .LongCountAsync(cancellationToken);
    }

    public virtual Task<bool> HasAttachmentsAsync(ApprovalRequestTask task, CancellationToken cancellationToken) =>
        Task.FromResult(false);

    protected virtual async Task<ApprovalRequestTask?> GetTaskAsync(
        AppUser user,
        Guid globalId,
        CancellationToken cancellationToken)
    {
        var scope = await AccessScopeProvider.GetAsync(user, cancellationToken);
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
            .Where(AccessPolicy.CanWorkTask(scope))
            .FirstOrDefaultAsync(task => task.GlobalId == globalId,
                cancellationToken);
    }

    protected virtual async Task<ApprovalRequestTaskDetailsResult?> GetRequestForTaskAsync(
        ApprovalRequestTask task,
        CancellationToken cancellationToken)
    {
        var hiddenStepSequences = await ListHiddenStepSequencesAsync(
            task.ApprovalRequestId,
            task.ApprovalRequestStepAssigneeId,
            cancellationToken);
        var approvalRequest = await GetRequestDetailsQuery(
                Db.ApprovalRequests.AsNoTracking(),
                hiddenStepSequences)
            .FirstOrDefaultAsync(request => request.Id == task.ApprovalRequestId, cancellationToken);
        if (approvalRequest is null)
        {
            return null;
        }

        await PopulateTaskFilesAsync(approvalRequest.Steps.SelectMany(step => step.Tasks), cancellationToken);
        task.ApprovalRequest = approvalRequest;
        var assigneeGlobalIdMaps = await AssigneeGlobalIdResolver.ResolveAsync(approvalRequest, cancellationToken);
        return ApprovalRequestMapper.MapTaskDetail(task, hiddenStepSequences, assigneeGlobalIdMaps);
    }

    protected virtual IQueryable<ApprovalRequest> GetRequestDetailsQuery(
        IQueryable<ApprovalRequest> requests,
        IReadOnlyCollection<int> hiddenStepSequences) => requests
            .AsSplitQuery()
            .Include(request => request.CreatedByUser)
            .Include(request => request.CompletedByUser)
            .Include(request => request.NextRevisionApprovalRequest)
                .ThenInclude(nextRevision => nextRevision!.CreatedByUser)
            .Include(request => request.RequestFiles)
                .ThenInclude(file => file.UserFile)
            .Include(request => request.Steps.Where(step => !hiddenStepSequences.Contains(step.Sequence)))
                .ThenInclude(step => step.Assignees)
                    .ThenInclude(assignee => assignee.User)
            .Include(request => request.Steps.Where(step => !hiddenStepSequences.Contains(step.Sequence)))
                .ThenInclude(step => step.Tasks)
                    .ThenInclude(requestTask => requestTask.ApprovalRequestStepAssignee)
                        .ThenInclude(assignee => assignee!.User)
            .Include(request => request.Steps.Where(step => !hiddenStepSequences.Contains(step.Sequence)))
                .ThenInclude(step => step.Tasks)
                    .ThenInclude(requestTask => requestTask.AssigneeUser)
            .Include(request => request.Steps.Where(step => !hiddenStepSequences.Contains(step.Sequence)))
                .ThenInclude(step => step.Tasks)
                    .ThenInclude(requestTask => requestTask.CompletedByUser);

    protected virtual Task PopulateTaskFilesAsync(
        IEnumerable<ApprovalRequestTask> tasks,
        CancellationToken cancellationToken) => Task.CompletedTask;

    protected async Task<List<int>> ListHiddenStepSequencesAsync(
        long approvalRequestId,
        long? approvalRequestStepAssigneeId,
        CancellationToken cancellationToken)
    {
        if (!approvalRequestStepAssigneeId.HasValue)
        {
            return [];
        }

        return await Db.ApprovalRequestSteps
            .AsNoTracking()
            .Where(step => step.ApprovalRequestId == approvalRequestId
                && step.VisibilityMode == ApprovalStepVisibilityMode.AssigneesOnly
                && !step.Assignees.Any(assignee => assignee.Id == approvalRequestStepAssigneeId.Value))
            .Select(step => step.Sequence)
            .ToListAsync(cancellationToken);
    }
}
