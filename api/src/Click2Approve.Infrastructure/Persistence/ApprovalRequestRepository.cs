using Click2Approve.Application.Abstractions.Authorization;
using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Application.Abstractions.TenantContext;
using Click2Approve.Application.Models.Commands.ApprovalRequests;
using Click2Approve.Application.Models.Results.Grids;
using Click2Approve.Application.Models.Results.ApprovalRequests;
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

    public virtual async Task<GridPageResult<ApprovalRequestListItemResult>> ListAsync(
        AppUser user,
        ApprovalRequestListQueryCommand query,
        CancellationToken cancellationToken)
    {
        var scope = await AccessScopeProvider.GetAsync(user, cancellationToken);
        var requests = Db.ApprovalRequests
            .AsNoTracking()
            .Where(AccessPolicy.CanManageRequest(scope));

        if (query.Status.Count > 0)
        {
            requests = requests.Where(request => query.Status.Contains(request.Status));
        }

        if (!string.IsNullOrWhiteSpace(query.Title))
        {
            requests = requests.Where(request => request.Title.Contains(query.Title));
        }

        if (!string.IsNullOrWhiteSpace(query.RequestedBy))
        {
            requests = requests.Where(request => request.CreatedByDisplayName.Contains(query.RequestedBy)
                || request.CreatedByUser.NormalizedEmail!.Contains(query.RequestedBy));
        }

        if (query.CreatedFrom.HasValue)
        {
            var createdFromUtc = DateTime.SpecifyKind(
                query.CreatedFrom.Value.ToDateTime(TimeOnly.MinValue),
                DateTimeKind.Utc);
            requests = requests.Where(request => request.CreatedAt >= createdFromUtc);
        }

        if (query.CreatedTo.HasValue)
        {
            var exclusiveCreatedToUtc = DateTime.SpecifyKind(
                query.CreatedTo.Value.AddDays(1).ToDateTime(TimeOnly.MinValue),
                DateTimeKind.Utc);
            requests = requests.Where(request => request.CreatedAt < exclusiveCreatedToUtc);
        }

        var totalCount = await requests.CountAsync(cancellationToken);
        var ordered = query.SortDirection switch
        {
            ApprovalRequestListSortDirection.Asc => requests.OrderBy(request => request.CreatedAt).ThenBy(request => request.GlobalId),
            _ => requests.OrderByDescending(request => request.CreatedAt).ThenBy(request => request.GlobalId)
        };
        var items = await ordered
            .Skip(query.Page * query.PageSize)
            .Take(query.PageSize)
            .Select(request => new ApprovalRequestListItemResult
            {
                GlobalId = request.GlobalId,
                Title = request.Title,
                Status = request.Status,
                Result = request.Result,
                CreatedAt = request.CreatedAt,
                CreatedByDisplayName = request.CreatedByEmployeeId.HasValue
                    ? request.CreatedByDisplayName
                    : request.CreatedByUser.NormalizedEmail ?? string.Empty,
                RevisionNumber = request.RevisionNumber
            })
            .ToListAsync(cancellationToken);

        return new GridPageResult<ApprovalRequestListItemResult> { Items = items, TotalCount = totalCount };
    }

    public async Task<int> CountAsync(AppUser user, DateTime start, DateTime end, CancellationToken cancellationToken)
    {
        var scope = await AccessScopeProvider.GetAsync(user, cancellationToken);
        return await Db.ApprovalRequests.Where(AccessPolicy.CanManageRequest(scope)).CountAsync(r =>
            r.CreatedAt >= start
            && r.CreatedAt < end, cancellationToken);
    }

    public virtual Task RemoveAsync(ApprovalRequest approvalRequest, CancellationToken cancellationToken)
    {
        Db.ApprovalRequestFiles.RemoveRange(approvalRequest.RequestFiles);
        Db.ApprovalRequestTasks.RemoveRange(approvalRequest.Steps.SelectMany(step => step.Tasks));
        Db.ApprovalRequestStepAssignees.RemoveRange(approvalRequest.Steps.SelectMany(step => step.Assignees));
        Db.ApprovalRequestSteps.RemoveRange(approvalRequest.Steps);
        Db.ApprovalRequests.Remove(approvalRequest);
        return Task.CompletedTask;
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
            .ThenInclude(step => step.Tasks)
                .ThenInclude(task => task.AssigneeUser)
        .Include(request => request.Steps)
            .ThenInclude(step => step.Tasks)
                .ThenInclude(task => task.CompletedByUser);
}
