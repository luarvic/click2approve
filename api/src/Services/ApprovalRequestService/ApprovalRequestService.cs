using api.Models;
using api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

// Implements a service that manages approval requests.
public class ApprovalRequestService(FileManagerDbContext db) : IApprovalRequestService
{
    private readonly FileManagerDbContext _db = db;

    public async Task<List<ApprovalRequest>> ListIncomingAsync(AppUser user, ApprovalRequestStatuses[] statuses, CancellationToken cancellationToken)
    {
        var approver = await _db.Approvers.FirstOrDefaultAsync(a => a.Email == user.NormalizedEmail, cancellationToken: cancellationToken);
        return approver == null ? [] : await _db.ApprovalRequests
            .Include(r => r.UserFiles)
            .Include(r => r.Approvers)
            .Where(r => statuses.Contains(r.Status) && r.Approvers.Contains(approver))
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ApprovalRequest>> ListOutgoingAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _db.ApprovalRequests
            .Include(r => r.UserFiles)
            .Include(r => r.Approvers)
            .Where(r => r.Author == user.NormalizedEmail)
            .ToListAsync(cancellationToken);
    }

    public async Task SubmitAsync(AppUser user, ApprovalRequestDto payload, CancellationToken cancellationToken)
    {
        var longIds = payload.Ids.Select(long.Parse);
        var userFiles = await _db.UserFiles
            .Where(f => longIds.Contains(f.Id) && f.Owner == user.Id)
            .ToListAsync(cancellationToken);
        var approvers = new List<Approver>();
        var sent = DateTime.UtcNow;
        foreach (var email in payload.Emails)
        {
            var approver = await _db.Approvers.FirstOrDefaultAsync(a => a.Email == email.ToUpper(), cancellationToken)
                ?? _db.Add(new Approver { Email = email.ToUpper() }).Entity;
            approvers.Add(approver);
        }
        _db.ApprovalRequests.Add(new ApprovalRequest
        {
            UserFiles = userFiles,
            Approvers = approvers,
            ApproveBy = payload.ApproveBy,
            Sent = sent,
            Comment = payload.Comment,
            Status = ApprovalRequestStatuses.Submitted,
            Author = user.NormalizedEmail!
        });
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<long> CountIncomingAsync(AppUser user, ApprovalRequestStatuses[] statuses, CancellationToken cancellationToken)
    {
        var approver = await _db.Approvers.FirstOrDefaultAsync(a => a.Email == user.NormalizedEmail, cancellationToken: cancellationToken);
        return approver == null ? 0 : await _db.ApprovalRequests
            .Where(r => statuses.Contains(r.Status) && r.Approvers.Contains(approver))
            .CountAsync(cancellationToken);
    }
}
