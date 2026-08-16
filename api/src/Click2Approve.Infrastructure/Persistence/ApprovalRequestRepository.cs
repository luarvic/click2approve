using Click2Approve.Application.Abstractions.Authorization;
using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Application.Abstractions.TenantContext;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for approval requests.
/// </summary>
public class ApprovalRequestRepository(
    ApiDbContext db,
    ITenantContext tenantContext,
    IAccessScopeProvider accessScopeProvider,
    IAccessPolicy accessPolicy) : IApprovalRequestRepository
{
    protected readonly ApiDbContext Db = db;
    protected readonly ITenantContext TenantContext = tenantContext;
    protected readonly IAccessScopeProvider AccessScopeProvider = accessScopeProvider;
    protected readonly IAccessPolicy AccessPolicy = accessPolicy;

    public virtual async Task<ApprovalRequest> AddAsync(ApprovalRequest approvalRequest, CancellationToken cancellationToken)
    {
        var entry = await Db.ApprovalRequests.AddAsync(approvalRequest, cancellationToken);
        return entry.Entity;
    }

    public virtual async Task<ApprovalRequest?> GetForUpdateAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var scope = await AccessScopeProvider.GetAsync(user, cancellationToken);
        return await IncludeDetails(Db.ApprovalRequests)
            .Where(AccessPolicy.CanManageRequest(scope))
            .FirstOrDefaultAsync(r => r.GlobalId == globalId, cancellationToken);
    }

    public virtual async Task<ApprovalRequest?> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var scope = await AccessScopeProvider.GetAsync(user, cancellationToken);
        return await IncludeDetails(Db.ApprovalRequests)
            .AsNoTracking()
            .Where(AccessPolicy.CanManageRequest(scope))
            .FirstOrDefaultAsync(r => r.GlobalId == globalId, cancellationToken);
    }

    public virtual async Task<List<ApprovalRequest>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var scope = await AccessScopeProvider.GetAsync(user, cancellationToken);
        return await Db.ApprovalRequests
            .AsNoTracking()
            .Include(r => r.CreatedByUser)
            .Where(AccessPolicy.CanManageRequest(scope))
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountAsync(AppUser user, DateTime start, DateTime end, CancellationToken cancellationToken)
    {
        var scope = await AccessScopeProvider.GetAsync(user, cancellationToken);
        return await Db.ApprovalRequests.Where(AccessPolicy.CanManageRequest(scope)).CountAsync(r =>
            r.CreatedAt >= start
            && r.CreatedAt < end, cancellationToken);
    }

    protected static IQueryable<ApprovalRequest> IncludeDetails(IQueryable<ApprovalRequest> requests) => requests
        .AsSplitQuery()
        .Include(request => request.CreatedByUser)
            .Include(request => request.CompletedByUser)
        .Include(request => request.NextRevisionApprovalRequest)
            .ThenInclude(nextRevision => nextRevision!.CreatedByUser)
        .Include(request => request.PreviousRevisionApprovalRequest)
        .Include(request => request.RequestFiles)
            .ThenInclude(file => file.UserFile)
                .ThenInclude(userFile => userFile.Owner)
        .Include(request => request.Steps)
            .ThenInclude(step => step.Assignees)
                .ThenInclude(assignee => assignee.User)
        .Include(request => request.Steps)
            .ThenInclude(step => step.StepVisibilities)
                .ThenInclude(visibility => visibility.ApprovalRequestStepAssignee)
                    .ThenInclude(assignee => assignee.User)
        .Include(request => request.Steps)
            .ThenInclude(step => step.Tasks)
                .ThenInclude(task => task.AssigneeUser)
        .Include(request => request.Steps)
            .ThenInclude(step => step.Tasks)
                .ThenInclude(task => task.CompletedByUser);
}
