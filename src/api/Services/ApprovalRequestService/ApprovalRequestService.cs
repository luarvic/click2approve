using api.Models;
using api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ApprovalRequestService(FileManagerDbContext db) : IApprovalRequestService
{
    private readonly FileManagerDbContext _db = db;

    public async Task SubmitAsync(AppUser user, ApprovalRequestDto payload, CancellationToken cancellationToken)
    {
        var longIds = payload.Ids.Select(long.Parse);
        var userFiles = await _db.UserFiles
            .Where(f => longIds.Contains(f.Id) && f.Owner == user.Id)
            .ToListAsync(cancellationToken);
        var approvers = new List<Approver>();
        foreach (var email in payload.Emails)
        {
            var approver = await _db.Approvers.FirstOrDefaultAsync(a => a.Email == email.ToLower(), cancellationToken)
                ?? _db.Add(new Approver { Email = email.ToLower() }).Entity;
            approvers.Add(approver);
        }
        _db.ApprovalRequests.Add(new ApprovalRequest
        {
            UserFiles = userFiles,
            Approvers = approvers,
            ApproveBy = payload.ApproveBy,
            SendDate = DateTime.UtcNow,
            Comment = payload.Comment
        });
        await _db.SaveChangesAsync(cancellationToken);
    }
}
