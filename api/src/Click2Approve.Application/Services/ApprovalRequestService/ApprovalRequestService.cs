using Click2Approve.Domain.Exceptions;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;
using Click2Approve.Application.Models.Auxiliary;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Application.Services.ApprovalRequestService;
using Click2Approve.Application.Services.AuditLogService;
using Click2Approve.Application.Services.EmailService;
using Click2Approve.Application.Services.TenantContext;

namespace Click2Approve.Application.Services.ApprovalRequestService;

/// <summary>
/// Implements a service that manages approval requests and approval request tasks.
/// </summary>
public class ApprovalRequestService(
    IApprovalRequestRepository approvalRequestRepository,
    IApprovalRequestTaskRepository approvalRequestTaskRepository,
    ITenantRepository tenantRepository,
    IUserFileRepository userFileRepository,
    IUnitOfWork unitOfWork,
    IAuditLogService auditLogService,
    IEmailService emailService,
    ITenantContext tenantContext,
    IConfiguration configuration) : IApprovalRequestService
{
    private readonly IApprovalRequestRepository _approvalRequestRepository = approvalRequestRepository;
    private readonly IApprovalRequestTaskRepository _approvalRequestTaskRepository = approvalRequestTaskRepository;
    private readonly ITenantRepository _tenantRepository = tenantRepository;
    private readonly IUserFileRepository _userFileRepository = userFileRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IAuditLogService _auditLogService = auditLogService;
    private readonly IEmailService _emailService = emailService;
    private readonly ITenantContext _tenantContext = tenantContext;
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Creates a new approval request.
    /// </summary>
    public async Task SubmitApprovalRequestAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken)
    {
        await CheckLimitations(user, payload, cancellationToken);

        // Collect required data.
        var userFiles = await _userFileRepository.ListByOwnerAndIdsAsync(user, payload.UserFileIds, cancellationToken);
        var normalizedEmails = payload.Emails.Select(e => e.ToUpper()).ToList();
        var utcNow = DateTime.UtcNow;
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);

        // Add request.
        var newApprovalRequest = await _approvalRequestRepository.AddAsync(new ApprovalRequest
        {
            UserFiles = userFiles,
            Approvers = normalizedEmails,
            ApproveBy = payload.ApproveBy,
            Submitted = utcNow,
            Comment = payload.Comment,
            Status = ApprovalStatus.Submitted,
            TenantId = tenantId,
            Author = user.NormalizedEmail!,
            Tasks = []
        }, cancellationToken);

        // Add tasks.
        foreach (var approver in normalizedEmails)
        {
            var approverTenant = await _tenantRepository.GetDefaultForUserEmailAsync(approver, cancellationToken);
            await _approvalRequestTaskRepository.AddAsync(new ApprovalRequestTask
            {
                ApprovalRequest = newApprovalRequest,
                Approver = approver,
                TenantId = approverTenant?.Id ?? tenantId,
                Status = ApprovalStatus.Submitted
            }, cancellationToken);
        }
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Add audit log entry.
        await _auditLogService.LogAsync(user,
            utcNow,
            "Submitted approval request",
            newApprovalRequest.ToString(),
            cancellationToken
        );

        // Notify approvers via email.
        foreach (var email in payload.Emails)
        {
            var sentHeadingTemplate = _configuration["Email:Templates:ApprovalRequestSentHeading"]!;
            var sentMessageTemplate = _configuration["Email:Templates:ApprovalRequestSentMessage"]!;
            var sentLinkText = _configuration["Email:Templates:ApprovalRequestSentLinkText"]!;
            var sentSubject = _configuration["Email:Templates:ApprovalRequestSentSubject"]!;
            var sentLink = $"{_configuration["UI:BaseUrl"]}/inbox";

            await _emailService.SendAsync(new EmailMessage
            {
                ToAddress = email.ToLower(),
                Subject = sentSubject,
                Body = EmailHelpers.BuildHtmlEmail(
                    sentHeadingTemplate,
                    string.Format(sentMessageTemplate,
                        newApprovalRequest.Author.ToLower(),
                        string.Join(", ", newApprovalRequest.UserFiles.Select(f => f.Name))),
                    sentLink,
                    sentLinkText)
            }, cancellationToken);
        }
    }

    /// <summary>
    /// Deletes the approval request.
    /// </summary>
    public async Task DeleteApprovalRequestAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var approvalRequest = await _approvalRequestRepository.GetForDeleteAsync(user, id, cancellationToken);
        var approvalRequestJson = approvalRequest.ToString();
        _approvalRequestRepository.Remove(approvalRequest);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Add audit log entry.
        await _auditLogService.LogAsync(user,
            DateTime.UtcNow,
            "Deleted approval request",
            approvalRequestJson,
            cancellationToken
        );

        // Notify approvers via email.
        foreach (var email in approvalRequest.Approvers)
        {
            var deletedHeadingTemplate = _configuration["Email:Templates:ApprovalRequestDeletedHeading"]!;
            var deletedMessageTemplate = _configuration["Email:Templates:ApprovalRequestDeletedMessage"]!;
            var deletedLinkText = _configuration["Email:Templates:ApprovalRequestDeletedLinkText"]!;
            var deletedSubject = _configuration["Email:Templates:ApprovalRequestDeletedSubject"]!;
            var deletedLink = $"{_configuration["UI:BaseUrl"]}/inbox";

            await _emailService.SendAsync(new EmailMessage
            {
                ToAddress = email.ToLower(),
                Subject = deletedSubject,
                Body = EmailHelpers.BuildHtmlEmail(
                    deletedHeadingTemplate,
                    string.Format(deletedMessageTemplate,
                        approvalRequest.Author.ToLower(),
                        string.Join(", ", approvalRequest.UserFiles.Select(f => f.Name))),
                    deletedLink,
                    deletedLinkText)
            }, cancellationToken);
        }
    }

    /// <summary>
    /// Lists the approval requests of the user.
    /// </summary>
    public async Task<List<ApprovalRequest>> ListApprovalRequestsAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _approvalRequestRepository.ListByAuthorAsync(user, cancellationToken);
    }

    /// <summary>
    /// Lists the approval request tasks.
    /// </summary>
    public async Task<List<ApprovalRequestTask>> ListTasksAsync(AppUser user, ApprovalStatus[] statuses, CancellationToken cancellationToken)
    {
        return await _approvalRequestTaskRepository.ListByApproverAsync(user, statuses, cancellationToken);
    }

    /// <summary>
    /// Completes the approval request task.
    /// </summary>
    public async Task CompleteTaskAsync(AppUser user, ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken)
    {
        var approvalRequestTask = await _approvalRequestTaskRepository.GetForCompletionAsync(user, payload.Id, cancellationToken);
        if (approvalRequestTask.Status != ApprovalStatus.Submitted)
        {
            throw new BusinessRuleException("The task has already been completed.");
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
        await _auditLogService.LogAsync(user,
            DateTime.UtcNow,
            "Completed task",
            approvalRequestTask.ToString(),
            cancellationToken
        );

        // Notify requester via email.
        var reviewedHeadingTemplate = _configuration["Email:Templates:ApprovalRequestReviewedHeading"]!;
        var reviewedMessageTemplate = _configuration["Email:Templates:ApprovalRequestReviewedMessage"]!;
        var reviewedLinkText = _configuration["Email:Templates:ApprovalRequestReviewedLinkText"]!;
        var reviewedSubject = _configuration["Email:Templates:ApprovalRequestReviewedSubject"]!;
        var reviewedLink = $"{_configuration["UI:BaseUrl"]}/sent";

        await _emailService.SendAsync(new EmailMessage
        {
            ToAddress = approvalRequestTask.ApprovalRequest.Author.ToLower(),
            Subject = reviewedSubject,
            Body = EmailHelpers.BuildHtmlEmail(
                reviewedHeadingTemplate,
                string.Format(reviewedMessageTemplate,
                    user.Email!.ToLower(),
                    string.Join(", ", approvalRequestTask.ApprovalRequest.UserFiles.Select(f => f.Name))),
                reviewedLink,
                reviewedLinkText)
        }, cancellationToken);
    }

    /// <summary>
    /// Counts uncompleted approval request tasks.
    /// </summary>
    public async Task<long> CountUncompletedTasksAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _approvalRequestTaskRepository.CountUncompletedByApproverAsync(user, cancellationToken);
    }

    /// <summary>
    /// Checks the limitations defined for approval requests and throws
    /// when any of them is exceeded.
    /// </summary>
    private async Task CheckLimitations(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken)
    {
        var maxApprovalRequestsPerDay = _configuration.GetValue<int>("Limitations:MaxApprovalRequestsPerDay");
        if (maxApprovalRequestsPerDay > 0)
        {
            var utcTodayStart = DateTime.UtcNow.Date;
            var utcTomorrowStart = utcTodayStart.AddDays(1);
            var approvalRequestCount = await _approvalRequestRepository.CountSubmittedByAuthorAsync(
                user,
                utcTodayStart,
                utcTomorrowStart,
                cancellationToken);
            if (approvalRequestCount >= maxApprovalRequestsPerDay)
            {
                throw new LimitExceededException(
                    $"The maximum number of approval requests per day ({maxApprovalRequestsPerDay}) has been exceeded.");
            }
        }

        var maxApproversPerRequest = _configuration.GetValue<int>("Limitations:MaxApproversPerRequest");
        if (maxApproversPerRequest > 0)
        {
            var approverCount = payload.Emails.Count;
            if (approverCount > maxApproversPerRequest)
            {
                throw new LimitExceededException(
                    $"The maximum number of approvers ({maxApproversPerRequest}) has been exceeded.");
            }
        }
    }
}
