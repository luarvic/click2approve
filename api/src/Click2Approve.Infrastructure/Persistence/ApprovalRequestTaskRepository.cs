using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for approval request tasks.
/// </summary>
public class ApprovalRequestTaskRepository(ApiDbContext db) : IApprovalRequestTaskRepository
{
    private readonly ApiDbContext _db = db;

    public async Task<ApprovalRequestTask> AddAsync(ApprovalRequestTask approvalRequestTask, CancellationToken cancellationToken)
    {
        var entry = await _db.ApprovalRequestTasks.AddAsync(approvalRequestTask, cancellationToken);
        return entry.Entity;
    }

    public Task<List<ApprovalRequestTask>> ListByApproverAsync(AppUser user, ApprovalStatus[] statuses, CancellationToken cancellationToken)
    {
        return _db.ApprovalRequestTasks
            .Include(t => t.ApprovalRequest)
            .Include(t => t.ApprovalRequest.UserFiles)
            .Where(t => statuses.Contains(t.Status) && t.Approver == user.NormalizedEmail)
            .ToListAsync(cancellationToken);
    }

    public Task<ApprovalRequestTask> GetForCompletionAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        return _db.ApprovalRequestTasks
            .Include(t => t.ApprovalRequest)
            .Include(t => t.ApprovalRequest.UserFiles)
            .Include(t => t.ApprovalRequest.Tasks)
            .FirstAsync(t => t.Id == id && t.Approver == user.NormalizedEmail, cancellationToken);
    }

    public Task<long> CountUncompletedByApproverAsync(AppUser user, CancellationToken cancellationToken)
    {
        return _db.ApprovalRequestTasks
            .Where(t => t.Approver == user.NormalizedEmail && t.Status == ApprovalStatus.Submitted)
            .LongCountAsync(cancellationToken);
    }
}
