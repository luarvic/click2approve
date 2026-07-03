using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for approval requests.
/// </summary>
public class ApprovalRequestRepository(ApiDbContext db) : IApprovalRequestRepository
{
    private readonly ApiDbContext _db = db;

    public async Task<ApprovalRequest> AddAsync(ApprovalRequest approvalRequest, CancellationToken cancellationToken)
    {
        var entry = await _db.ApprovalRequests.AddAsync(approvalRequest, cancellationToken);
        return entry.Entity;
    }

    public Task<ApprovalRequest> GetForDeleteAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        return _db.ApprovalRequests
            .Include(r => r.Tasks)
            .Include(r => r.UserFiles)
            .FirstAsync(r => r.Id == id && r.Author == user.NormalizedEmail, cancellationToken);
    }

    public async Task<IList<ApprovalRequest>> ListByUserFileIdAsync(long userFileId, CancellationToken cancellationToken)
    {
        return await _db.ApprovalRequests
            .Where(r => r.UserFiles.Any(f => f.Id == userFileId))
            .ToListAsync(cancellationToken);
    }

    public Task<List<ApprovalRequest>> ListByAuthorAsync(AppUser user, CancellationToken cancellationToken)
    {
        return _db.ApprovalRequests
            .Include(r => r.UserFiles)
            .Include(r => r.Tasks)
            .Where(r => r.Author == user.NormalizedEmail)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountSubmittedByAuthorAsync(AppUser user, DateTime utcStart, DateTime utcEnd, CancellationToken cancellationToken)
    {
        return _db.ApprovalRequests.CountAsync(r => r.Author == user.NormalizedEmail
            && r.Submitted >= utcStart
            && r.Submitted < utcEnd, cancellationToken);
    }

    public void Remove(ApprovalRequest approvalRequest)
    {
        _db.ApprovalRequests.Remove(approvalRequest);
    }
}
