using Click2Approve.Application.Extensions;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.Auxiliary;
using Click2Approve.Application.Models.Auxiliary.ApprovalRequests;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Implements shared approval workflow operations.
/// </summary>
public class ApprovalWorkflowService(
    IApprovalRequestTaskRepository approvalRequestTaskRepository,
    IEmailService emailService,
    IUserNotificationPreferenceService notificationPreferenceService,
    IApprovalRecipientResolver approvalRecipientResolver,
    IConfiguration configuration) : IApprovalWorkflowService
{
    private readonly IApprovalRequestTaskRepository _approvalRequestTaskRepository = approvalRequestTaskRepository;
    private readonly IEmailService _emailService = emailService;
    private readonly IUserNotificationPreferenceService _notificationPreferenceService = notificationPreferenceService;
    private readonly IApprovalRecipientResolver _approvalRecipientResolver = approvalRecipientResolver;
    private readonly IConfiguration _configuration = configuration;

    public async Task<Dictionary<ApprovalRequestStepApprover, List<ApprovalRecipientResolution>>> ResolveApproversAsync(
        ApprovalRequest approvalRequest,
        List<ApprovalRequestStepSubmitDto> submittedSteps,
        CancellationToken cancellationToken)
    {
        var submittedStepsBySequence = submittedSteps
            .OrderBy(step => step.Sequence)
            .Select((step, index) => new { Sequence = index + 1, Step = step })
            .ToDictionary(item => item.Sequence, item => item.Step);
        var approvers = approvalRequest.Steps
            .SelectMany(step => step.Approvers.Select((approver, index) =>
            {
                var submittedApprover = GetSubmittedApprover(step.Sequence, index);
                return new ApprovalRecipientResolveItem(
                    step,
                    approver,
                    submittedApprover?.Email,
                    submittedApprover?.EmployeeGlobalId,
                    submittedApprover?.TeamGlobalId);
            }))
            .ToList();
        return await _approvalRecipientResolver.ResolveAsync(approvalRequest, approvers, cancellationToken);

        ApprovalRequestApproverSubmitDto? GetSubmittedApprover(int sequence, int index)
        {
            return submittedStepsBySequence.TryGetValue(sequence, out var submittedStep)
                && index < submittedStep.Approvers.Count
                    ? submittedStep.Approvers[index]
                    : null;
        }
    }

    public async Task<List<ApprovalRequestTask>> CreateTasksForStepAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        DateTime timestamp,
        CancellationToken cancellationToken)
    {
        return await CreateTasksForStepAsync(
            approvalRequest,
            step,
            approverResolutions: null,
            timestamp,
            cancellationToken);
    }

    public async Task<List<ApprovalRequestTask>> CreateTasksForStepAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        IReadOnlyDictionary<ApprovalRequestStepApprover, List<ApprovalRecipientResolution>>? approverResolutions,
        DateTime timestamp,
        CancellationToken cancellationToken)
    {
        var tasks = new List<ApprovalRequestTask>();
        foreach (var configuredApprover in step.Approvers)
        {
            var resolutions = approverResolutions is not null
                && approverResolutions.TryGetValue(configuredApprover, out var cachedResolutions)
                    ? cachedResolutions
                    : null;
            var createdTasks = await CreateTasksForApproverAsync(
                approvalRequest,
                step,
                configuredApprover,
                resolutions,
                timestamp,
                cancellationToken);
            tasks.AddRange(createdTasks);
        }

        return tasks;
    }

    public async Task AdvanceAsync(
        ApprovalRequestTask approvalRequestTask,
        DateTime timestamp,
        CancellationToken cancellationToken)
    {
        var approvalRequest = approvalRequestTask.ApprovalRequest;
        var currentStep = approvalRequestTask.ApprovalRequestStep;
        var currentStepTasks = currentStep.Tasks
            .Where(task => task.ApprovalRequestStepId == currentStep.Id || task.ApprovalRequestStep == currentStep)
            .ToList();

        var stepIsCompletedSuccessfully = currentStep.Mode switch
        {
            ApprovalStepMode.Any => currentStepTasks.Any(task => task.Status == ApprovalRequestTaskStatus.Completed && task.Result == true),
            ApprovalStepMode.All => currentStepTasks.All(task => task.Status == ApprovalRequestTaskStatus.Completed && task.Result == true),
            _ => false
        };
        if (!stepIsCompletedSuccessfully)
        {
            return;
        }

        if (currentStep.Mode == ApprovalStepMode.Any)
        {
            SkipPendingTasks(currentStepTasks.Where(task => task.Id != approvalRequestTask.Id), timestamp);
        }

        var nextStep = approvalRequest.Steps
            .Where(step => step.Sequence > currentStep.Sequence)
            .OrderBy(step => step.Sequence)
            .FirstOrDefault();

        if (nextStep is null)
        {
            approvalRequest.Status = ApprovalRequestStatus.Completed;
            approvalRequest.Result = true;
            approvalRequest.CompletedAt = timestamp;
            SkipPendingTasks(GetTasks(approvalRequest), timestamp);
            return;
        }

        var nextStepTasks = await CreateTasksForStepAsync(approvalRequest, nextStep, timestamp, cancellationToken);
        await NotifyApproversSentAsync(nextStepTasks, cancellationToken);
    }

    public void StartRequestIfNeeded(ApprovalRequest approvalRequest, DateTime timestamp)
    {
        if (approvalRequest.Status != ApprovalRequestStatus.Pending)
        {
            return;
        }

        approvalRequest.Status = ApprovalRequestStatus.Started;
    }

    public void SkipPendingTasks(IEnumerable<ApprovalRequestTask> tasks, DateTime timestamp)
    {
        foreach (var task in tasks.Where(task => task.Status == ApprovalRequestTaskStatus.Pending))
        {
            task.Status = ApprovalRequestTaskStatus.Skipped;
            task.CompletedAt = timestamp;
        }
    }

    public void CancelPendingTasks(IEnumerable<ApprovalRequestTask> tasks, DateTime timestamp)
    {
        foreach (var task in tasks.Where(task => task.Status == ApprovalRequestTaskStatus.Pending))
        {
            task.Status = ApprovalRequestTaskStatus.Canceled;
            task.CompletedAt = timestamp;
        }
    }

    public IEnumerable<ApprovalRequestTask> GetTasks(ApprovalRequest approvalRequest)
    {
        return approvalRequest.Steps.SelectMany(step => step.Tasks);
    }

    public async Task NotifyApproversSentAsync(
        IEnumerable<ApprovalRequestTask> tasks,
        CancellationToken cancellationToken)
    {
        await NotifyApproversAsync(tasks, ApproverNotification.Sent, cancellationToken);
    }

    public async Task NotifyApproversCancelledAsync(
        IEnumerable<ApprovalRequestTask> tasks,
        ApprovalRequest approvalRequest,
        CancellationToken cancellationToken)
    {
        await NotifyApproversAsync(tasks, ApproverNotification.Cancelled, cancellationToken, approvalRequest);
    }

    private async Task NotifyApproversAsync(
        IEnumerable<ApprovalRequestTask> tasks,
        ApproverNotification notification,
        CancellationToken cancellationToken,
        ApprovalRequest? approvalRequest = null)
    {
        var taskList = tasks.ToList();
        if (taskList.Count == 0)
        {
            return;
        }

        var template = GetApproverNotificationTemplate(notification);
        approvalRequest ??= taskList.First().ApprovalRequest;
        var link = UriHelpers.GetUiUri(
            _configuration.GetValue<Uri>("UI:BaseUrl"),
            _configuration["UI:AppPath"],
            "inbox").ToString();

        var notificationType = GetNotificationType(notification);
        var recipients = taskList
            .GroupBy(task => task.ApproverUserId)
            .Select(group => new
            {
                UserId = group.Key,
                Email = group.Select(task => task.ApproverUser?.NormalizedEmail).FirstOrDefault(email => !string.IsNullOrWhiteSpace(email))
            });

        foreach (var recipient in recipients)
        {
            if (string.IsNullOrWhiteSpace(recipient.UserId) || string.IsNullOrWhiteSpace(recipient.Email))
            {
                continue;
            }

            if (!await _notificationPreferenceService.IsEnabledAsync(
                recipient.UserId,
                notificationType,
                NotificationChannel.Email,
                cancellationToken))
            {
                continue;
            }

            await _emailService.SendAsync(new EmailMessage
            {
                ToAddress = recipient.Email,
                Subject = template.Subject,
                Body = EmailHelpers.BuildHtmlEmail(
                    template.Heading,
                    string.Format(template.Message,
                        approvalRequest.CreatedByUser.NormalizedEmailOrEmpty(),
                        GetActiveFileNames(approvalRequest)),
                    link,
                    template.LinkText)
            }, cancellationToken);
        }
    }

    public async Task NotifyRequesterReviewedAsync(
        AppUser reviewer,
        ApprovalRequestTask approvalRequestTask,
        CancellationToken cancellationToken)
    {
        var approvalRequest = approvalRequestTask.ApprovalRequest;
        if (!await _notificationPreferenceService.IsEnabledAsync(
            approvalRequest.CreatedByUserId,
            NotificationType.ApprovalRequestReviewed,
            NotificationChannel.Email,
            cancellationToken))
        {
            return;
        }

        var reviewedHeadingTemplate = _configuration["Email:Templates:ApprovalRequestReviewedHeading"]!;
        var reviewedMessageTemplate = _configuration["Email:Templates:ApprovalRequestReviewedMessage"]!;
        var reviewedLinkText = _configuration["Email:Templates:ApprovalRequestReviewedLinkText"]!;
        var reviewedSubject = _configuration["Email:Templates:ApprovalRequestReviewedSubject"]!;
        var reviewedLink = UriHelpers.GetUiUri(
            _configuration.GetValue<Uri>("UI:BaseUrl"),
            _configuration["UI:AppPath"],
            "sent").ToString();

        await _emailService.SendAsync(new EmailMessage
        {
            ToAddress = approvalRequest.CreatedByUser.NormalizedEmailOrEmpty(),
            Subject = reviewedSubject,
            Body = EmailHelpers.BuildHtmlEmail(
                reviewedHeadingTemplate,
                string.Format(reviewedMessageTemplate,
                    reviewer.NormalizedEmailOrEmpty(),
                    GetActiveFileNames(approvalRequest)),
                reviewedLink,
                reviewedLinkText)
        }, cancellationToken);
    }

    private async Task<List<ApprovalRequestTask>> CreateTasksForApproverAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        ApprovalRequestStepApprover configuredApprover,
        List<ApprovalRecipientResolution>? resolvedApprovers,
        DateTime timestamp,
        CancellationToken cancellationToken)
    {
        var tasks = new List<ApprovalRequestTask>();
        var resolutions = resolvedApprovers ?? await _approvalRecipientResolver.ResolveAsync(
            approvalRequest,
            step,
            configuredApprover,
            cancellationToken);

        foreach (var resolution in resolutions)
        {
            var task = await _approvalRequestTaskRepository.AddAsync(new ApprovalRequestTask
            {
                Title = approvalRequest.Title,
                Description = approvalRequest.Description,
                ApprovalRequest = approvalRequest,
                ApprovalRequestStep = step,
                ApprovalRequestStepApprover = configuredApprover,
                ApproverUser = resolution.ApproverUser,
                ApproverUserId = resolution.ApproverUser.Id,
                ApproverEmployeeId = resolution.ApproverEmployeeId,
                ApproverDisplayName = resolution.ApproverDisplayName,
                ApproverOrganizationDisplayName = resolution.ApproverOrganizationDisplayName,
                TenantId = resolution.TenantId,
                RevisionNumber = approvalRequest.RevisionNumber,
                Action = step.Action,
                Status = ApprovalRequestTaskStatus.Pending,
                CreatedAt = timestamp
            }, cancellationToken);
            step.Tasks.Add(task);
            tasks.Add(task);
        }

        return tasks;
    }

    private static IEnumerable<ApprovalRequestFile> OrderRequestFiles(ApprovalRequest approvalRequest) =>
        approvalRequest.RequestFiles.OrderBy(file => file.Sequence);

    private static string GetActiveFileNames(ApprovalRequest approvalRequest) =>
        string.Join(", ", OrderRequestFiles(approvalRequest)
            .Where(file => file.RevisionAction != ApprovalRequestFileRevisionAction.Removed)
            .Select(file => file.UserFile.Name));

    private static NotificationType GetNotificationType(ApproverNotification notification)
    {
        return notification switch
        {
            ApproverNotification.Cancelled => NotificationType.ApprovalRequestCancelled,
            _ => NotificationType.ApprovalRequestTaskCreated
        };
    }

    private ApproverNotificationTemplate GetApproverNotificationTemplate(ApproverNotification notification)
    {
        var templateName = notification switch
        {
            ApproverNotification.Cancelled => "ApprovalRequestCancelled",
            _ => "ApprovalRequestSent"
        };

        return new ApproverNotificationTemplate(
            _configuration[$"Email:Templates:{templateName}Heading"]!,
            _configuration[$"Email:Templates:{templateName}Message"]!,
            _configuration[$"Email:Templates:{templateName}LinkText"]!,
            _configuration[$"Email:Templates:{templateName}Subject"]!);
    }

    /// <summary>
    /// Contains email template text for approver notifications.
    /// </summary>
    private sealed record ApproverNotificationTemplate(
        string Heading,
        string Message,
        string LinkText,
        string Subject);

    private enum ApproverNotification
    {
        Sent,
        Cancelled
    }
}
