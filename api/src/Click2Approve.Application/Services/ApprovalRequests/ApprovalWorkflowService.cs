using System.Text.Json;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.Auxiliary;
using Click2Approve.Application.Models.Auxiliary.ApprovalRequests;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Application.Persistence;
using Click2Approve.Application.Services.Email;
using Click2Approve.Application.Services.Notifications;
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
    IApprovalLogActorResolver approvalLogActorResolver,
    IConfiguration configuration) : IApprovalWorkflowService
{
    private readonly IApprovalRequestTaskRepository _approvalRequestTaskRepository = approvalRequestTaskRepository;
    private readonly IEmailService _emailService = emailService;
    private readonly IUserNotificationPreferenceService _notificationPreferenceService = notificationPreferenceService;
    private readonly IApprovalRecipientResolver _approvalRecipientResolver = approvalRecipientResolver;
    private readonly IApprovalLogActorResolver _approvalLogActorResolver = approvalLogActorResolver;
    private readonly IConfiguration _configuration = configuration;
    private static readonly JsonSerializerOptions LogDetailsJsonOptions = new(JsonSerializerDefaults.Web);

    public ApprovalLogActor SystemActor { get; } = new(
        Type: ApprovalLogActorType.System,
        UserId: null,
        EmployeeId: null,
        Email: "system",
        DisplayName: "System");

    public Task<ApprovalLogActor> ResolveActorAsync(AppUser user, long tenantId, CancellationToken cancellationToken)
    {
        return _approvalLogActorResolver.ResolveAsync(user, tenantId, cancellationToken);
    }

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
        ApprovalLogActor actor,
        DateTime timestamp,
        CancellationToken cancellationToken)
    {
        var approvalRequest = approvalRequestTask.ApprovalRequest;
        var currentStep = approvalRequestTask.ApprovalRequestStep;
        var currentStepTasks = currentStep.Tasks
            .Where(task => task.ApprovalRequestStepId == currentStep.Id || task.ApprovalRequestStep == currentStep)
            .ToList();

        var stepIsApproved = currentStep.Mode switch
        {
            ApprovalStepMode.Any => currentStepTasks.Any(task => task.Status == ApprovalRequestTaskStatus.Approved),
            ApprovalStepMode.All => currentStepTasks.All(task => task.Status == ApprovalRequestTaskStatus.Approved),
            _ => false
        };
        if (!stepIsApproved)
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
            var previousStatus = approvalRequest.Status;
            approvalRequest.Status = ApprovalRequestStatus.Approved;
            AddStatusLog(approvalRequest, timestamp, previousStatus, ApprovalRequestStatus.Approved);
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

        var previousStatus = approvalRequest.Status;
        approvalRequest.Status = ApprovalRequestStatus.Started;
        AddStatusLog(approvalRequest, timestamp, previousStatus, ApprovalRequestStatus.Started);
    }

    public void SkipPendingTasks(IEnumerable<ApprovalRequestTask> tasks, DateTime timestamp)
    {
        foreach (var task in tasks.Where(task => task.Status == ApprovalRequestTaskStatus.Pending))
        {
            var previousStatus = task.Status;
            task.Status = ApprovalRequestTaskStatus.Skipped;
            AddStatusLog(task, SystemActor, timestamp, previousStatus, ApprovalRequestTaskStatus.Skipped, task.Comment);
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
            .GroupBy(task => task.ApproverEmail, StringComparer.OrdinalIgnoreCase)
            .Select(group => new
            {
                Email = group.Key,
                UserId = group.Select(task => task.ApproverUserId).FirstOrDefault(id => !string.IsNullOrWhiteSpace(id))
            });

        foreach (var recipient in recipients)
        {
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
                ToAddress = recipient.Email.ToLower(),
                Subject = template.Subject,
                Body = EmailHelpers.BuildHtmlEmail(
                    template.Heading,
                    string.Format(template.Message,
                        approvalRequest.CreatedByEmail.ToLower(),
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
            ToAddress = approvalRequest.CreatedByEmail.ToLower(),
            Subject = reviewedSubject,
            Body = EmailHelpers.BuildHtmlEmail(
                reviewedHeadingTemplate,
                string.Format(reviewedMessageTemplate,
                    reviewer.Email!.ToLower(),
                    GetActiveFileNames(approvalRequest)),
                reviewedLink,
                reviewedLinkText)
        }, cancellationToken);
    }

    public void AddSubmittedLog(
        ApprovalRequest approvalRequest,
        ApprovalLogActor actor,
        DateTime timestamp)
    {
        AddRequestLog(
            approvalRequest,
            actor,
            timestamp,
            ApprovalRequestLogEventType.Submitted,
            new ApprovalRequestSubmittedDetails(approvalRequest.Status));
    }

    public void AddStatusLog(
        ApprovalRequest approvalRequest,
        DateTime timestamp,
        ApprovalRequestStatus? previousStatus,
        ApprovalRequestStatus status)
    {
        AddRequestLog(
            approvalRequest,
            SystemActor,
            timestamp,
            ApprovalRequestLogEventType.StatusChanged,
            new ApprovalRequestStatusChangedDetails(previousStatus, status));
    }

    public void AddStatusLog(
        ApprovalRequestTask task,
        ApprovalLogActor actor,
        DateTime timestamp,
        ApprovalRequestTaskStatus? previousStatus,
        ApprovalRequestTaskStatus status,
        string? comment)
    {
        AddTaskLog(
            task,
            actor,
            GetOnBehalfOfActor(task, actor),
            timestamp,
            ApprovalRequestTaskLogEventType.StatusChanged,
            new ApprovalRequestTaskStatusChangedDetails(previousStatus, status, comment));
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
                ApproverEmail = resolution.ApproverEmail,
                ApproverUserId = resolution.ApproverUserId,
                ApproverEmployeeId = resolution.ApproverEmployeeId,
                ApproverDisplayName = resolution.ApproverDisplayName,
                TenantId = resolution.TenantId,
                RevisionNumber = approvalRequest.RevisionNumber,
                Status = ApprovalRequestTaskStatus.Pending,
                CreatedAt = timestamp
            }, cancellationToken);
            AddTaskSubmittedLog(task, timestamp);
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

    private void AddTaskSubmittedLog(ApprovalRequestTask task, DateTime timestamp)
    {
        AddTaskLog(
            task,
            SystemActor,
            null,
            timestamp,
            ApprovalRequestTaskLogEventType.Submitted,
            new ApprovalRequestTaskSubmittedDetails(task.Status));
    }

    private static void AddTaskLog<TDetails>(
        ApprovalRequestTask task,
        ApprovalLogActor actor,
        ApprovalLogActor? onBehalfOfActor,
        DateTime timestamp,
        ApprovalRequestTaskLogEventType eventType,
        TDetails details)
    {
        task.LogEntries.Add(new ApprovalRequestTaskLogEntry
        {
            ApprovalRequestTaskId = task.Id,
            ApprovalRequestTask = task,
            Timestamp = timestamp,
            ActorType = actor.Type,
            ActorUserId = actor.UserId,
            ActorEmployeeId = actor.EmployeeId,
            ActorEmail = actor.Email,
            ActorDisplayName = actor.DisplayName,
            OnBehalfOfActorType = onBehalfOfActor?.Type,
            OnBehalfOfUserId = onBehalfOfActor?.UserId,
            OnBehalfOfEmployeeId = onBehalfOfActor?.EmployeeId,
            OnBehalfOfEmail = onBehalfOfActor?.Email,
            OnBehalfOfDisplayName = onBehalfOfActor?.DisplayName,
            EventType = eventType,
            Details = SerializeDetails(details),
            TenantId = task.TenantId
        });
    }

    private static void AddRequestLog<TDetails>(
        ApprovalRequest approvalRequest,
        ApprovalLogActor actor,
        DateTime timestamp,
        ApprovalRequestLogEventType eventType,
        TDetails details)
    {
        approvalRequest.LogEntries.Add(new ApprovalRequestLogEntry
        {
            ApprovalRequestId = approvalRequest.Id,
            ApprovalRequest = approvalRequest,
            Timestamp = timestamp,
            ActorType = actor.Type,
            ActorUserId = actor.UserId,
            ActorEmployeeId = actor.EmployeeId,
            ActorEmail = actor.Email,
            ActorDisplayName = actor.DisplayName,
            EventType = eventType,
            Details = SerializeDetails(details),
            TenantId = approvalRequest.TenantId
        });
    }

    private static ApprovalLogActor? GetOnBehalfOfActor(ApprovalRequestTask task, ApprovalLogActor actor)
    {
        if (actor.Type != ApprovalLogActorType.Employee
            || task.ApproverEmployeeId is null
            || task.ApproverEmployeeId == actor.EmployeeId)
        {
            return null;
        }

        return new ApprovalLogActor(
            Type: ApprovalLogActorType.Employee,
            UserId: task.ApproverUserId,
            EmployeeId: task.ApproverEmployeeId,
            Email: task.ApproverEmail,
            DisplayName: task.ApproverDisplayName);
    }

    private static string SerializeDetails<TDetails>(TDetails details)
    {
        return JsonSerializer.Serialize(details, LogDetailsJsonOptions);
    }

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
