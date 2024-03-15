using api.Models;
using api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

// Implements a service that manages approval requests.
public class ApprovalRequestService(ApiDbContext db) : IApprovalRequestService
{
    private readonly ApiDbContext _db = db;

    public async Task SubmitApprovalRequestAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken)
    {
        var userFiles = await _db.UserFiles
            .Where(f => payload.UserFileIds.Contains(f.Id) && f.Owner == user.Id)
            .ToListAsync(cancellationToken);
        var normalizedEmails = payload.Emails.Select(e => e.ToUpper()).ToList();
        var utcNow = DateTime.UtcNow;
        // Add request.
        var newApprovalRequest = _db.ApprovalRequests.Add(new ApprovalRequest
        {
            UserFiles = userFiles,
            Approvers = normalizedEmails,
            ApproveBy = payload.ApproveBy,
            Submitted = utcNow,
            Comment = payload.Comment,
            Status = ApprovalStatus.Submitted,
            Author = user.NormalizedEmail!,
            Tasks = []
        });
        // Add tasks.
        foreach (var approver in normalizedEmails)
        {
            _db.ApprovalRequestTasks.Add(new ApprovalRequestTask
            {
                ApprovalRequest = newApprovalRequest.Entity,
                Approver = approver.ToUpper(),
                Status = ApprovalStatus.Submitted
            });
        }
        // Add audit log entry.
        _db.AuditLogEntries.Add(new AuditLogEntry
        {
            Who = user.NormalizedEmail!,
            When = utcNow,
            What = "Submitted approval request.",
            Data = newApprovalRequest.Entity.ToString()
        });
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<ApprovalRequest>> ListApprovalRequestsAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _db.ApprovalRequests
            .Include(r => r.UserFiles)
            .Include(r => r.Tasks)
            .Where(r => r.Author == user.NormalizedEmail)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ApprovalRequestTask>> ListTasksAsync(AppUser user, ApprovalStatus[] statuses, CancellationToken cancellationToken)
    {
        return await _db.ApprovalRequestTasks
            .Include(t => t.ApprovalRequest)
            .Where(t => statuses.Contains(t.Status) && t.Approver == user.NormalizedEmail)
            .ToListAsync(cancellationToken);
    }

    public async Task CompleteTaskAsync(AppUser user, ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken)
    {
        var approvalRequestTask = await _db.ApprovalRequestTasks
            .Include(t => t.ApprovalRequest)
            .FirstAsync(t => t.Id == payload.Id && t.Approver == user.NormalizedEmail, cancellationToken);
        if (approvalRequestTask.Status != ApprovalStatus.Submitted)
        {
            throw new Exception("Task is already completed.");
        }

        // Complete approval request task.
        approvalRequestTask.Status = payload.Status;
        approvalRequestTask.Comment = payload.Comment;

        // Calculate and update approval request status.
        if (approvalRequestTask.ApprovalRequest.Status == ApprovalStatus.Submitted)
        {
            if (payload.Status == ApprovalStatus.Rejected)
            {
                approvalRequestTask.ApprovalRequest.Status = ApprovalStatus.Rejected;
            }
            else if (!approvalRequestTask.ApprovalRequest.Tasks.Any(t => t.Status != ApprovalStatus.Approved && t.Approver != user.NormalizedEmail))
            {
                approvalRequestTask.ApprovalRequest.Status = ApprovalStatus.Approved;
            }
        }

        // Add log entry.
        _db.AuditLogEntries.Add(new AuditLogEntry
        {
            Who = user.NormalizedEmail!,
            When = DateTime.UtcNow,
            What = $"{payload.Status} task.",
            Data = approvalRequestTask.ToString()
        });
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<long> CountUncompletedTasksAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _db.ApprovalRequestTasks
            .Where(t => t.Approver == user.NormalizedEmail && t.Status == ApprovalStatus.Submitted)
            .CountAsync(cancellationToken);
    }
}
