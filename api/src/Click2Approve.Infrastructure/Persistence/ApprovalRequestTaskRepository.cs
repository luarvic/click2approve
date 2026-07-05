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

    public async Task<List<ApprovalRequestTask>> ListByApproverAsync(AppUser user, ApprovalStatus[] statuses, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.ApprovalRequestTasks
            .Include(t => t.ApprovalRequest)
            .Include(t => t.ApprovalRequest.UserFiles)
            .Where(t => t.TenantId == tenantId && statuses.Contains(t.Status) && t.Approver == user.NormalizedEmail)
            .ToListAsync(cancellationToken);
    }

    public async Task<ApprovalRequestTask> GetForCompletionAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.ApprovalRequestTasks
            .Include(t => t.ApprovalRequest)
            .Include(t => t.ApprovalRequest.UserFiles)
            .Include(t => t.ApprovalRequest.Tasks)
            .FirstAsync(t => t.TenantId == tenantId && t.Id == id && t.Approver == user.NormalizedEmail, cancellationToken);
    }

    public async Task<long> CountUncompletedByApproverAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.ApprovalRequestTasks
            .Where(t => t.TenantId == tenantId && t.Approver == user.NormalizedEmail && t.Status == ApprovalStatus.Submitted)
            .LongCountAsync(cancellationToken);
    }
}
