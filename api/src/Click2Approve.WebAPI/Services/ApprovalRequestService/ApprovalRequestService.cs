using Click2Approve.WebAPI.Models;
using Click2Approve.WebAPI.Models.DTOs;
using Click2Approve.WebAPI.Services.AuditLogService;
using Click2Approve.WebAPI.Services.EmailService;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.WebAPI.Services.ApprovalRequestService;

/// <summary>
/// Implements a service that manages approval requests and approval request tasks.
/// </summary>
public class ApprovalRequestService(ApiDbContext db,
    IAuditLogService auditLogService,
    IEmailService emailService,
    IConfiguration configuration) : IApprovalRequestService
{
    private readonly ApiDbContext _db = db;
    private readonly IAuditLogService _auditLogService = auditLogService;
    private readonly IEmailService _emailService = emailService;
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Checks the limitations defined for approval requests and throws
    /// when any of them is exceeded.
    /// </summary>
    private async Task CheckLimitations(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken)
    {
        var maxApprovalRequestCount = _configuration.GetValue<int>("Limitations:MaxApprovalRequestCount");
        if (maxApprovalRequestCount > 0)
        {
            var approvalRequestCount = await _db.ApprovalRequests.CountAsync(r => r.Author == user.NormalizedEmail, cancellationToken);
            if (approvalRequestCount + 1 > maxApprovalRequestCount)
            {
                throw new Exception($"Maximum approval request count ({maxApprovalRequestCount}) is exceeded.");
            }
        }

        var maxApproverCount = _configuration.GetValue<int>("Limitations:MaxApproverCount");
        if (maxApproverCount > 0)
        {
            var approverCount = payload.Emails.Count;
            if (approverCount > maxApproverCount)
            {
                throw new Exception($"Maximum approver count ({maxApproverCount}) is exceeded.");
            }
        }
    }

    /// <summary>
    /// Creates a new approval request.
    /// </summary>
    public async Task SubmitApprovalRequestAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken)
    {
        await CheckLimitations(user, payload, cancellationToken);

        // Collect required data.
        var userFiles = await _db.UserFiles
            .Where(f => payload.UserFileIds.Contains(f.Id) && f.Owner == user)
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
                Approver = approver,
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

        // Notify approvers via email.
        foreach (var email in payload.Emails)
        {
            await _emailService.SendAsync(new EmailMessage
            {
                ToAddress = email.ToLower(),
                Subject = _configuration["EmailSettings:Templates:ApprovalRequestSentSubject"]!,
                Body = string.Format(_configuration["EmailSettings:Templates:ApprovalRequestSentBody"]!,
                    newApprovalRequest.Entity.Author.ToLower(),
                    string.Join(", ", newApprovalRequest.Entity.UserFiles.Select(f => f.Name)),
                    $"{_configuration["UI:BaseUrl"]}/inbox")
            }, cancellationToken);
        }
    }

    /// <summary>
    /// Deletes the approval request.
    /// </summary>
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

        // Notify approvers via email.
        foreach (var email in approvalRequest.Approvers)
        {
            await _emailService.SendAsync(new EmailMessage
            {
                ToAddress = email.ToLower(),
                Subject = _configuration["EmailSettings:Templates:ApprovalRequestDeletedSubject"]!,
                Body = string.Format(_configuration["EmailSettings:Templates:ApprovalRequestDeletedBody"]!,
                    approvalRequest.Author.ToLower(),
                    string.Join(", ", approvalRequest.UserFiles.Select(f => f.Name)))
            }, cancellationToken);
        }
    }

    /// <summary>
    /// Lists the approval requests of the user.
    /// </summary>
    public async Task<List<ApprovalRequest>> ListApprovalRequestsAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _db.ApprovalRequests
            .Include(r => r.UserFiles)
            .Include(r => r.Tasks)
            .Where(r => r.Author == user.NormalizedEmail)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Lists the approval request tasks.
    /// </summary>
    public async Task<List<ApprovalRequestTask>> ListTasksAsync(AppUser user, ApprovalStatus[] statuses, CancellationToken cancellationToken)
    {
        return await _db.ApprovalRequestTasks
            .Include(t => t.ApprovalRequest)
            .Include(t => t.ApprovalRequest.UserFiles)
            .Where(t => statuses.Contains(t.Status) && t.Approver == user.NormalizedEmail)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Completes the approval request task.
    /// </summary>
    public async Task CompleteTaskAsync(AppUser user, ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken)
    {
        var approvalRequestTask = await _db.ApprovalRequestTasks
            .Include(t => t.ApprovalRequest)
            .Include(t => t.ApprovalRequest.UserFiles)
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

        // Notify requester via email.
        await _emailService.SendAsync(new EmailMessage
        {
            ToAddress = approvalRequestTask.ApprovalRequest.Author.ToLower(),
            Subject = _configuration["EmailSettings:Templates:ApprovalRequestReviewedSubject"]!,
            Body = string.Format(_configuration["EmailSettings:Templates:ApprovalRequestReviewedBody"]!,
                user.Email!.ToLower(),
                string.Join(", ", approvalRequestTask.ApprovalRequest.UserFiles.Select(f => f.Name)),
                $"{_configuration["UI:BaseUrl"]}/sent")
        }, cancellationToken);
    }

    /// <summary>
    /// Counts uncompleted approval request tasks.
    /// </summary>
    public async Task<long> CountUncompletedTasksAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _db.ApprovalRequestTasks
            .Where(t => t.Approver == user.NormalizedEmail && t.Status == ApprovalStatus.Submitted)
            .CountAsync(cancellationToken);
    }
}
