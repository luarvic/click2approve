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
    private readonly ApiDbContext _db = db;
    private readonly ITenantContext _tenantContext = tenantContext;

    public async Task<ApprovalRequest> AddAsync(ApprovalRequest approvalRequest, CancellationToken cancellationToken)
    {
        var entry = await _db.ApprovalRequests.AddAsync(approvalRequest, cancellationToken);
        return entry.Entity;
    }

    public async Task<ApprovalRequest> GetForDeleteAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.ApprovalRequests
            .Include(r => r.Tasks)
            .Include(r => r.Steps)
                .ThenInclude(s => s.Approvers)
            .Include(r => r.UserFiles)
            .FirstAsync(r => r.TenantId == tenantId && r.Id == id && r.CreatedByUserId == user.Id, cancellationToken);
    }

    public async Task<ApprovalRequest> GetForUpdateAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.ApprovalRequests
            .Include(r => r.UserFiles)
            .Include(r => r.Tasks)
            .Include(r => r.Steps)
                .ThenInclude(s => s.Approvers)
            .Include(r => r.Steps)
                .ThenInclude(s => s.Tasks)
            .FirstAsync(r => r.TenantId == tenantId && r.Id == id && r.CreatedByUserId == user.Id, cancellationToken);
    }

    public async Task<IList<ApprovalRequest>> ListAsync(AppUser user, long userFileId, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.ApprovalRequests
            .Where(r => r.TenantId == tenantId && r.UserFiles.Any(f => f.Id == userFileId))
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ApprovalRequest>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.ApprovalRequests
            .Include(r => r.UserFiles)
            .Include(r => r.Tasks)
            .Include(r => r.Steps)
                .ThenInclude(s => s.Approvers)
            .Include(r => r.Steps)
                .ThenInclude(s => s.Tasks)
            .Where(r => r.TenantId == tenantId && r.CreatedByUserId == user.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountAsync(AppUser user, DateTime start, DateTime end, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        return await _db.ApprovalRequests.CountAsync(r => r.TenantId == tenantId
            && r.CreatedByUserId == user.Id
            && r.CreatedAt >= start
            && r.CreatedAt < end, cancellationToken);
    }

    public void Remove(ApprovalRequest approvalRequest)
    {
        _db.ApprovalRequests.Remove(approvalRequest);
    }
}
