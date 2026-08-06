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
    IAssigneeResolver assigneeResolver,
    IConfiguration configuration) : IApprovalWorkflowService
{
    private readonly IApprovalRequestTaskRepository _approvalRequestTaskRepository = approvalRequestTaskRepository;
    private readonly IEmailService _emailService = emailService;
    private readonly IUserNotificationPreferenceService _notificationPreferenceService = notificationPreferenceService;
    private readonly IAssigneeResolver _assigneeResolver = assigneeResolver;
    private readonly IConfiguration _configuration = configuration;

    public async Task<Dictionary<ApprovalRequestStepAssignee, List<AssigneeResolution>>> ResolveAssigneesAsync(
        ApprovalRequest approvalRequest,
        List<ApprovalRequestStepSubmitDto> submittedSteps,
        CancellationToken cancellationToken)
    {
        var submittedStepsBySequence = submittedSteps
            .OrderBy(step => step.Sequence)
            .Select((step, index) => new { Sequence = index + 1, Step = step })
            .ToDictionary(item => item.Sequence, item => item.Step);
        var assignees = approvalRequest.Steps
            .SelectMany(step => step.Assignees.Select((assignee, index) =>
            {
                var submittedAssignee = GetSubmittedAssignee(step.Sequence, index);
                return new AssigneeResolveItem(
                    step,
                    assignee,
                    submittedAssignee?.Email,
                    submittedAssignee?.EmployeeGlobalId,
                    submittedAssignee?.TeamGlobalId);
            }))
            .ToList();
        return await _assigneeResolver.ResolveAsync(approvalRequest, assignees, cancellationToken);

        ApprovalRequestAssigneeSubmitDto? GetSubmittedAssignee(int sequence, int index)
        {
            return submittedStepsBySequence.TryGetValue(sequence, out var submittedStep)
                && index < submittedStep.Assignees.Count
                    ? submittedStep.Assignees[index]
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
            assigneeResolutions: null,
            timestamp,
            cancellationToken);
    }

    public async Task<List<ApprovalRequestTask>> CreateTasksForStepAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        IReadOnlyDictionary<ApprovalRequestStepAssignee, List<AssigneeResolution>>? assigneeResolutions,
        DateTime timestamp,
        CancellationToken cancellationToken)
    {
        var tasks = new List<ApprovalRequestTask>();
        foreach (var configuredAssignee in step.Assignees)
        {
            var resolutions = assigneeResolutions is not null
                && assigneeResolutions.TryGetValue(configuredAssignee, out var cachedResolutions)
                    ? cachedResolutions
                    : null;
            var createdTasks = await CreateTasksForAssigneeAsync(
                approvalRequest,
                step,
                configuredAssignee,
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
        await NotifyAssigneesSentAsync(nextStepTasks, cancellationToken);
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

    public async Task NotifyAssigneesSentAsync(
        IEnumerable<ApprovalRequestTask> tasks,
        CancellationToken cancellationToken)
    {
        await NotifyAssigneesAsync(tasks, AssigneeNotification.Sent, cancellationToken);
    }

    public async Task NotifyAssigneesCancelledAsync(
        IEnumerable<ApprovalRequestTask> tasks,
        ApprovalRequest approvalRequest,
        CancellationToken cancellationToken)
    {
        await NotifyAssigneesAsync(tasks, AssigneeNotification.Cancelled, cancellationToken, approvalRequest);
    }

    private async Task NotifyAssigneesAsync(
        IEnumerable<ApprovalRequestTask> tasks,
        AssigneeNotification notification,
        CancellationToken cancellationToken,
        ApprovalRequest? approvalRequest = null)
    {
        var taskList = tasks.ToList();
        if (taskList.Count == 0)
        {
            return;
        }

        var template = GetAssigneeNotificationTemplate(notification);
        approvalRequest ??= taskList.First().ApprovalRequest;
        var link = UriHelpers.GetUiUri(
            _configuration.GetValue<Uri>("UI:BaseUrl"),
            _configuration["UI:AppPath"],
            "inbox").ToString();

        var notificationType = GetNotificationType(notification);
        var recipients = taskList
            .GroupBy(task => task.AssigneeUserId)
            .Select(group => new
            {
                UserId = group.Key,
                Email = group.Select(task => task.AssigneeUser?.NormalizedEmail).FirstOrDefault(email => !string.IsNullOrWhiteSpace(email))
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

    private async Task<List<ApprovalRequestTask>> CreateTasksForAssigneeAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        ApprovalRequestStepAssignee configuredAssignee,
        List<AssigneeResolution>? resolvedAssignees,
        DateTime timestamp,
        CancellationToken cancellationToken)
    {
        var tasks = new List<ApprovalRequestTask>();
        var resolutions = resolvedAssignees ?? await _assigneeResolver.ResolveAsync(
            approvalRequest,
            step,
            configuredAssignee,
            cancellationToken);

        foreach (var resolution in resolutions)
        {
            var task = await _approvalRequestTaskRepository.AddAsync(new ApprovalRequestTask
            {
                Title = approvalRequest.Title,
                Description = approvalRequest.Description,
                ApprovalRequest = approvalRequest,
                ApprovalRequestStep = step,
                ApprovalRequestStepAssignee = configuredAssignee,
                AssigneeUser = resolution.AssigneeUser,
                AssigneeUserId = resolution.AssigneeUser.Id,
                AssigneeEmployeeId = resolution.AssigneeEmployeeId,
                AssigneeDisplayName = resolution.AssigneeDisplayName,
                OrganizationDisplayName = approvalRequest.OrganizationDisplayName,
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

    private static NotificationType GetNotificationType(AssigneeNotification notification)
    {
        return notification switch
        {
            AssigneeNotification.Cancelled => NotificationType.ApprovalRequestCancelled,
            _ => NotificationType.ApprovalRequestTaskCreated
        };
    }

    private AssigneeNotificationTemplate GetAssigneeNotificationTemplate(AssigneeNotification notification)
    {
        var templateName = notification switch
        {
            AssigneeNotification.Cancelled => "ApprovalRequestCancelled",
            _ => "ApprovalRequestSent"
        };

        return new AssigneeNotificationTemplate(
            _configuration[$"Email:Templates:{templateName}Heading"]!,
            _configuration[$"Email:Templates:{templateName}Message"]!,
            _configuration[$"Email:Templates:{templateName}LinkText"]!,
            _configuration[$"Email:Templates:{templateName}Subject"]!);
    }

    /// <summary>
    /// Contains email template text for assignee notifications.
    /// </summary>
    private sealed record AssigneeNotificationTemplate(
        string Heading,
        string Message,
        string LinkText,
        string Subject);

    private enum AssigneeNotification
    {
        Sent,
        Cancelled
    }
}
