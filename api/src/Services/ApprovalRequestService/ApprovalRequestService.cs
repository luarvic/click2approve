using api.Models;
using api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

// Implements a service that manages approval requests.
public class ApprovalRequestService(ApiDbContext db, IAuditLogService auditLogService) : IApprovalRequestService
{
    private readonly ApiDbContext _db = db;
    private readonly IAuditLogService _auditLogService = auditLogService;

    public async Task SubmitApprovalRequestAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken)
    {
        var userFiles = await _db.UserFiles
            .Where(f => payload.UserFileIds.Contains(f.Id) && f.Owner == user.Id)
            .ToListAsync(cancellationToken);
        var normalizedEmails = payload.Emails.Select(e => e.ToUpper()).ToList();
        var utcNow = DateTime.UtcNow;

        // Add request.
        var newApprovalRequest = await _db.ApprovalRequests.AddAsync(new ApprovalRequest
        {
            UserFiles = userFiles,
            Approvers = normalizedEmails,
            ApproveBy = payload.ApproveBy,
            Submitted = utcNow,
            Comment = payload.Comment,
            Status = ApprovalStatus.Submitted,
            Author = user.NormalizedEmail!,
            Tasks = []
        }, cancellationToken);

        // Add tasks.
        foreach (var approver in normalizedEmails)
        {
            await _db.ApprovalRequestTasks.AddAsync(new ApprovalRequestTask
            {
                ApprovalRequest = newApprovalRequest.Entity,
                Approver = approver.ToUpper(),
                Status = ApprovalStatus.Submitted
            }, cancellationToken);
        }
        await _db.SaveChangesAsync(cancellationToken);

        // Add audit log entry.
        await _auditLogService.LogAsync(user.NormalizedEmail!,
            utcNow,
            "Submitted approval request",
            newApprovalRequest.Entity.ToString(),
            cancellationToken
        );
    }

    public async Task DeleteApprovalRequestAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var approvalRequest = await _db.ApprovalRequests
            .Include(r => r.Tasks)
            .Include(r => r.UserFiles)
            .FirstAsync(r => r.Id == id && r.Author == user.NormalizedEmail, cancellationToken);
        var approvalRequestJson = approvalRequest.ToString();
        _db.ApprovalRequests.Remove(approvalRequest);
        await _db.SaveChangesAsync(cancellationToken);

        // Add audit log entry.
        await _auditLogService.LogAsync(user.NormalizedEmail!,
            DateTime.UtcNow,
            "Deleted approval request",
            approvalRequestJson,
            cancellationToken
        );
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
            .Include(t => t.ApprovalRequest.UserFiles)
            .Where(t => statuses.Contains(t.Status) && t.Approver == user.NormalizedEmail)
            .ToListAsync(cancellationToken);
    }

    public async Task CompleteTaskAsync(AppUser user, ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken)
    {
        var approvalRequestTask = await _db.ApprovalRequestTasks
            .Include(t => t.ApprovalRequest)
            .Include(t => t.ApprovalRequest.Tasks)
            .FirstAsync(t => t.Id == payload.Id && t.Approver == user.NormalizedEmail, cancellationToken);
        if (approvalRequestTask.Status != ApprovalStatus.Submitted)
        {
            throw new Exception("Task is already completed.");
        }

        // Complete approval request task.
        approvalRequestTask.Status = payload.Status;
        approvalRequestTask.Comment = payload.Comment;
        approvalRequestTask.Completed = DateTime.UtcNow;

        // Calculate and update approval request status.
        if (approvalRequestTask.ApprovalRequest.Status == ApprovalStatus.Submitted)
        {
            switch (payload.Status)
            {
                case ApprovalStatus.Rejected:
                    approvalRequestTask.ApprovalRequest.Status = ApprovalStatus.Rejected;
                    break;
                case ApprovalStatus.Approved:
                    if (!approvalRequestTask.ApprovalRequest.Tasks.Any(t => t.Id != approvalRequestTask.Id
                        && t.Status == ApprovalStatus.Submitted))
                    {
                        approvalRequestTask.ApprovalRequest.Status = ApprovalStatus.Approved;
                    }
                    break;
            }
        }

        // Add audit log entry.
        await _auditLogService.LogAsync(user.NormalizedEmail!,
            DateTime.UtcNow,
            "Completed task",
            approvalRequestTask.ToString(),
            cancellationToken
        );
    }

    public async Task<long> CountUncompletedTasksAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _db.ApprovalRequestTasks
            .Where(t => t.Approver == user.NormalizedEmail && t.Status == ApprovalStatus.Submitted)
            .CountAsync(cancellationToken);
    }
}
