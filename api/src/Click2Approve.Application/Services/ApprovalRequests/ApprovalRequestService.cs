using System.Text.Json;
using Click2Approve.Application.Models.Auxiliary.ApprovalRequests;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;
using Click2Approve.Application.Models.Auxiliary;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Application.Services.Email;
using Click2Approve.Application.Services.Notifications;
using Click2Approve.Application.Services.TenantContext;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Implements a service that manages approval requests and approval request tasks.
/// </summary>
public class ApprovalRequestService(
    IApprovalRequestRepository approvalRequestRepository,
    IApprovalRequestTaskRepository approvalRequestTaskRepository,
    IUserFileRepository userFileRepository,
    IUnitOfWork unitOfWork,
    IEmailService emailService,
    IUserNotificationPreferenceService notificationPreferenceService,
    IApprovalRecipientResolver approvalRecipientResolver,
    IApprovalRequestApproverGlobalIdResolver approverGlobalIdResolver,
    IApprovalLogActorResolver approvalLogActorResolver,
    ITenantContext tenantContext,
    IConfiguration configuration) : IApprovalRequestService
{
    protected readonly IApprovalRequestRepository _approvalRequestRepository = approvalRequestRepository;
    protected readonly IUnitOfWork _unitOfWork = unitOfWork;
    protected static readonly ApprovalLogActor SystemActor = new(
        Type: ApprovalLogActorType.System,
        UserId: null,
        EmployeeId: null,
        Email: "system",
        DisplayName: "System");

    private readonly IApprovalRequestTaskRepository _approvalRequestTaskRepository = approvalRequestTaskRepository;
    private readonly IUserFileRepository _userFileRepository = userFileRepository;
    private readonly IEmailService _emailService = emailService;
    private readonly IUserNotificationPreferenceService _notificationPreferenceService = notificationPreferenceService;
    private readonly IApprovalRecipientResolver _approvalRecipientResolver = approvalRecipientResolver;
    private readonly IApprovalRequestApproverGlobalIdResolver _approverGlobalIdResolver = approverGlobalIdResolver;
    private readonly IApprovalLogActorResolver _approvalLogActorResolver = approvalLogActorResolver;
    private readonly ITenantContext _tenantContext = tenantContext;
    private readonly IConfiguration _configuration = configuration;
    private static readonly JsonSerializerOptions LogDetailsJsonOptions = new(JsonSerializerDefaults.Web);

    /// <summary>
    /// Creates a new approval request.
    /// </summary>
    public async Task<Guid> SubmitApprovalRequestAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken)
    {
        var title = (payload.Title ?? string.Empty).Trim();
        if (title.Length == 0)
        {
            throw new BusinessRuleException("Title is required.");
        }

        await CheckLimitations(user, payload, cancellationToken);

        var userFileGlobalIds = payload.RequestFiles
            .Select(file => file.UserFileGlobalId)
            .Distinct()
            .ToList();
        if (userFileGlobalIds.Count == 0)
        {
            throw new BusinessRuleException("Add one or more files.");
        }

        var userFiles = await _userFileRepository.ListAsync(user, userFileGlobalIds, cancellationToken);
        if (userFiles.Count != userFileGlobalIds.Count)
        {
            throw new BusinessRuleException("One or more files could not be found.");
        }

        var now = DateTime.UtcNow;
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        var actor = await _approvalLogActorResolver.ResolveAsync(user, tenantId, cancellationToken);
        var steps = BuildSteps(payload.Steps);
        ApplyStepVisibility(steps, payload.StepVisibility);

        var newApprovalRequest = await _approvalRequestRepository.AddAsync(new ApprovalRequest
        {
            Title = title,
            RequestFiles = [.. BuildRequestFiles(payload.RequestFiles, userFiles)],
            Steps = steps,
            CreatedAt = now,
            Description = payload.Description,
            Status = ApprovalRequestStatus.Pending,
            TenantId = tenantId,
            CreatedByUserId = user.Id,
            CreatedByUser = user,
            CreatedByEmployeeId = actor.EmployeeId,
            CreatedByEmail = user.NormalizedEmail!,
            CreatedByDisplayName = actor.DisplayName
        }, cancellationToken);
        foreach (var requestFile in newApprovalRequest.RequestFiles)
        {
            requestFile.ApprovalRequest = newApprovalRequest;
        }

        var approverResolutions = await ResolveApproversAsync(newApprovalRequest, payload.Steps, cancellationToken);
        AddRequestSubmittedLog(newApprovalRequest, actor, now);

        var submittedTasks = await CreateTasksForStepAsync(
            newApprovalRequest,
            steps.MinBy(s => s.Sequence)!,
            approverResolutions,
            now,
            cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await NotifyApproversAsync(submittedTasks, ApprovalRequestApproverNotification.Sent, cancellationToken);
        return newApprovalRequest.GlobalId;
    }

    /// <summary>
    /// Cancels an approval request.
    /// </summary>
    public async Task CancelApprovalRequestAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var approvalRequest = await _approvalRequestRepository.GetForUpdateAsync(user, globalId, cancellationToken);
        if (approvalRequest.Status is not (ApprovalRequestStatus.Pending or ApprovalRequestStatus.Started))
        {
            throw new BusinessRuleException("The approval request cannot be cancelled.");
        }

        var now = DateTime.UtcNow;
        var previousStatus = approvalRequest.Status;
        approvalRequest.Status = ApprovalRequestStatus.Canceled;
        var notifiedTasks = GetTasks(approvalRequest).ToList();
        AddRequestStatusLog(approvalRequest, now, previousStatus, ApprovalRequestStatus.Canceled);
        SkipPendingTasks(notifiedTasks, now);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await NotifyApproversAsync(notifiedTasks, ApprovalRequestApproverNotification.Cancelled, cancellationToken);
    }

    /// <summary>
    /// Lists the approval requests of the user.
    /// </summary>
    public async Task<List<ApprovalRequestListItemDto>> ListApprovalRequestsAsync(AppUser user, CancellationToken cancellationToken)
    {
        var approvalRequests = await _approvalRequestRepository.ListAsync(user, cancellationToken);
        return [.. approvalRequests.Select(ApprovalRequestMapper.MapApprovalRequestListItem)];
    }

    /// <summary>
    /// Gets an approval request with all data required by its editor.
    /// </summary>
    public async Task<ApprovalRequestDto> GetApprovalRequestAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var approvalRequest = await _approvalRequestRepository.GetAsync(user, globalId, cancellationToken);
        // Approver rows keep tenant-local employee/team IDs; resolve public global IDs before DTO mapping.
        var approverGlobalIdMaps = await _approverGlobalIdResolver.ResolveAsync(approvalRequest, cancellationToken);
        return ApprovalRequestMapper.MapApprovalRequest(approvalRequest, approverGlobalIdMaps);
    }

    /// <summary>
    /// Lists the approval request tasks.
    /// </summary>
    public async Task<List<ApprovalRequestTaskListItemDto>> ListTasksAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tasks = await _approvalRequestTaskRepository.ListAsync(user, cancellationToken);
        return [.. tasks.Select(ApprovalRequestMapper.MapTaskListItem)];
    }

    /// <summary>
    /// Gets a task with the request data the approver is authorized to view.
    /// </summary>
    public async Task<ApprovalRequestTaskDetailDto> GetTaskAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var task = await _approvalRequestTaskRepository.GetAsync(user, globalId, cancellationToken);
        var approvalRequest = await _approvalRequestTaskRepository.GetRequestForTaskAsync(user, globalId, cancellationToken);

        // Approver rows keep tenant-local employee/team IDs; resolve public global IDs before DTO mapping.
        var approverGlobalIdMaps = approvalRequest is null
            ? ApprovalRequestApproverGlobalIdMaps.Empty
            : await _approverGlobalIdResolver.ResolveAsync(approvalRequest, cancellationToken);
        return ApprovalRequestMapper.MapTaskDetail(task, approvalRequest, approverGlobalIdMaps);
    }

    /// <summary>
    /// Completes the approval request task.
    /// </summary>
    public async Task CompleteTaskAsync(AppUser user, ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken)
    {
        var approvalRequestTask = await _approvalRequestTaskRepository.GetForCompletionAsync(user, payload.GlobalId, cancellationToken);
        if (approvalRequestTask.Status != ApprovalRequestTaskStatus.Pending)
        {
            throw new BusinessRuleException("The task has already been completed.");
        }

        var now = DateTime.UtcNow;
        var actor = await ResolveActorAsync(user, approvalRequestTask.TenantId, cancellationToken);
        var previousTaskStatus = approvalRequestTask.Status;
        approvalRequestTask.Status = payload.Status;
        approvalRequestTask.Comment = payload.Comment;
        AddTaskStatusLog(approvalRequestTask, actor, now, previousTaskStatus, payload.Status, payload.Comment);

        if (approvalRequestTask.ApprovalRequest.Status is ApprovalRequestStatus.Pending or ApprovalRequestStatus.Started)
        {
            switch (payload.Status)
            {
                case ApprovalRequestTaskStatus.Rejected:
                    var previousRequestStatus = approvalRequestTask.ApprovalRequest.Status;
                    approvalRequestTask.ApprovalRequest.Status = ApprovalRequestStatus.Rejected;
                    AddRequestStatusLog(approvalRequestTask.ApprovalRequest, now, previousRequestStatus, ApprovalRequestStatus.Rejected);
                    SkipPendingTasks(GetTasks(approvalRequestTask.ApprovalRequest).Where(t => t.Id != approvalRequestTask.Id), now);
                    break;
                case ApprovalRequestTaskStatus.Approved:
                    await AdvanceWorkflowAsync(approvalRequestTask, actor, now, cancellationToken);
                    StartRequestIfNeeded(approvalRequestTask.ApprovalRequest, now);
                    break;
                default:
                    throw new BusinessRuleException("A task can only be approved or rejected.");
            }
        }

        // Notify requester via email.
        var reviewedHeadingTemplate = _configuration["Email:Templates:ApprovalRequestReviewedHeading"]!;
        var reviewedMessageTemplate = _configuration["Email:Templates:ApprovalRequestReviewedMessage"]!;
        var reviewedLinkText = _configuration["Email:Templates:ApprovalRequestReviewedLinkText"]!;
        var reviewedSubject = _configuration["Email:Templates:ApprovalRequestReviewedSubject"]!;
        var reviewedLink = UriHelpers.GetUiUri(
            _configuration.GetValue<Uri>("UI:BaseUrl"),
            _configuration["UI:AppPath"],
            "sent").ToString();

        if (await _notificationPreferenceService.IsEnabledAsync(
            approvalRequestTask.ApprovalRequest.CreatedByUserId,
            NotificationType.ApprovalRequestReviewed,
            NotificationChannel.Email,
            cancellationToken))
        {
            await _emailService.SendAsync(new EmailMessage
            {
                ToAddress = approvalRequestTask.ApprovalRequest.CreatedByEmail.ToLower(),
                Subject = reviewedSubject,
                Body = EmailHelpers.BuildHtmlEmail(
                    reviewedHeadingTemplate,
                    string.Format(reviewedMessageTemplate,
                        user.Email!.ToLower(),
                        GetActiveFileNames(approvalRequestTask.ApprovalRequest)),
                    reviewedLink,
                    reviewedLinkText)
            }, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Counts uncompleted approval request tasks.
    /// </summary>
    public async Task<long> CountUncompletedTasksAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _approvalRequestTaskRepository.CountUncompletedAsync(user, cancellationToken);
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
            var todayStart = DateTime.UtcNow.Date;
            var tomorrowStart = todayStart.AddDays(1);
            var approvalRequestCount = await _approvalRequestRepository.CountAsync(
                user,
                todayStart,
                tomorrowStart,
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
            var approverCount = payload.Steps.Sum(s => s.Approvers.Count);
            if (approverCount > maxApproversPerRequest)
            {
                throw new LimitExceededException(
                $"The maximum number of approvers ({maxApproversPerRequest}) has been exceeded.");
            }
        }

    }

    private static IEnumerable<ApprovalRequestFile> OrderRequestFiles(ApprovalRequest approvalRequest) =>
        approvalRequest.RequestFiles.OrderBy(file => file.Sequence);

    private static IEnumerable<ApprovalRequestFile> BuildRequestFiles(
        IEnumerable<ApprovalRequestFileSubmitDto> submittedFiles,
        IEnumerable<UserFile> userFiles)
    {
        var userFilesByGlobalId = userFiles.ToDictionary(file => file.GlobalId);
        return submittedFiles
            .OrderBy(file => file.Sequence)
            .Select((file, index) =>
            {
                var userFile = userFilesByGlobalId[file.UserFileGlobalId];
                return new ApprovalRequestFile
                {
                    UserFile = userFile,
                    UserFileId = userFile.Id,
                    Sequence = index,
                    RevisionAction = file.RevisionAction,
                    ApprovalRequest = null!
                };
            });
    }

    private static string GetActiveFileNames(ApprovalRequest approvalRequest) =>
        string.Join(", ", OrderRequestFiles(approvalRequest)
            .Where(file => file.RevisionAction != ApprovalRequestFileRevisionAction.Removed)
            .Select(file => file.UserFile.Name));

    private static List<ApprovalRequestStep> BuildSteps(List<ApprovalRequestStepSubmitDto> stepDtos)
    {
        if (stepDtos.Count == 0)
        {
            throw new BusinessRuleException("Specify one or more approval steps.");
        }

        return [.. stepDtos
            .OrderBy(s => s.Sequence)
            .Select((stepDto, index) =>
            {
                if (stepDto.Approvers.Count == 0)
                {
                    throw new BusinessRuleException("Each approval step must have one or more approvers.");
                }

                return BuildStep(stepDto, index + 1);
            })];
    }

    private static ApprovalRequestStep BuildStep(ApprovalRequestStepSubmitDto stepDto, int sequence)
    {
        if (stepDto.Approvers.Count == 0)
        {
            throw new BusinessRuleException("Each approval step must have one or more approvers.");
        }

        return new ApprovalRequestStep
        {
            Sequence = sequence,
            Mode = stepDto.Mode,
            Approvers = [.. stepDto.Approvers.Select(BuildApprover)],
            ApprovalRequest = null!,
            Tasks = []
        };
    }

    private static ApprovalRequestStepApprover BuildApprover(ApprovalRequestApproverSubmitDto approver)
    {
        return new ApprovalRequestStepApprover
        {
            Type = approver.Type,
            Email = approver.Email
        };
    }

    private static void ApplyStepVisibility(
        List<ApprovalRequestStep> steps,
        List<ApprovalRequestStepVisibilitySubmitDto> visibilityDtos)
    {
        if (visibilityDtos.Count == 0)
        {
            return;
        }

        var stepsBySequence = steps.ToDictionary(step => step.Sequence);
        foreach (var visibilityDto in visibilityDtos)
        {
            if (!stepsBySequence.TryGetValue(visibilityDto.StepSequence, out var step)
                || !stepsBySequence.TryGetValue(visibilityDto.ApproverStepSequence, out var approverStep)
                || visibilityDto.ApproverIndex < 0
                || visibilityDto.ApproverIndex >= approverStep.Approvers.Count)
            {
                throw new BusinessRuleException("Step visibility contains an invalid step or approver.");
            }

            var approver = approverStep.Approvers[visibilityDto.ApproverIndex];
            var approverIsAssignedToStep = step.Approvers.Contains(approver);
            step.StepVisibilities.Add(new ApprovalRequestStepVisibility
            {
                ApprovalRequestStep = step,
                ApprovalRequestStepApprover = approver,
                IsVisible = approverIsAssignedToStep || visibilityDto.IsVisible
            });
        }
    }

    private static bool StepIsVisibleToApprover(
        ApprovalRequestStep step,
        long? approvalRequestStepApproverId)
    {
        if (approvalRequestStepApproverId is null)
        {
            return true;
        }

        if (step.Approvers.Any(approver => approver.Id == approvalRequestStepApproverId))
        {
            return true;
        }

        return step.StepVisibilities
            .FirstOrDefault(visibility => visibility.ApprovalRequestStepApproverId == approvalRequestStepApproverId)
            ?.IsVisible ?? true;
    }

    private async Task<List<ApprovalRequestTask>> CreateTasksForStepAsync(
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

    private async Task<List<ApprovalRequestTask>> CreateTasksForStepAsync(
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

    private async Task<Dictionary<ApprovalRequestStepApprover, List<ApprovalRecipientResolution>>> ResolveApproversAsync(
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
                Status = ApprovalRequestTaskStatus.Pending,
                CreatedAt = timestamp
            }, cancellationToken);
            AddTaskSubmittedLog(task, timestamp);
            step.Tasks.Add(task);
            tasks.Add(task);
        }

        return tasks;
    }

    private async Task AdvanceWorkflowAsync(
        ApprovalRequestTask approvalRequestTask,
        ApprovalLogActor actor,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var approvalRequest = approvalRequestTask.ApprovalRequest;
        var currentStep = approvalRequestTask.ApprovalRequestStep;
        var currentStepTasks = currentStep.Tasks
            .Where(t => t.ApprovalRequestStepId == currentStep.Id || t.ApprovalRequestStep == currentStep)
            .ToList();

        var stepIsApproved = currentStep.Mode switch
        {
            ApprovalStepMode.Any => currentStepTasks.Any(t => t.Status == ApprovalRequestTaskStatus.Approved),
            ApprovalStepMode.All => currentStepTasks.All(t => t.Status == ApprovalRequestTaskStatus.Approved),
            _ => false
        };
        if (!stepIsApproved)
        {
            return;
        }

        if (currentStep.Mode == ApprovalStepMode.Any)
        {
            SkipPendingTasks(currentStepTasks.Where(t => t.Id != approvalRequestTask.Id), now);
        }

        var nextStep = approvalRequest.Steps
            .Where(s => s.Sequence > currentStep.Sequence)
            .OrderBy(s => s.Sequence)
            .FirstOrDefault();

        if (nextStep is null)
        {
            var previousStatus = approvalRequest.Status;
            approvalRequest.Status = ApprovalRequestStatus.Approved;
            AddRequestStatusLog(approvalRequest, now, previousStatus, ApprovalRequestStatus.Approved);
            SkipPendingTasks(GetTasks(approvalRequest), now);
            return;
        }

        var nextStepTasks = await CreateTasksForStepAsync(approvalRequest, nextStep, now, cancellationToken);
        await NotifyApproversAsync(nextStepTasks, ApprovalRequestApproverNotification.Sent, cancellationToken);
    }

    private static void StartRequestIfNeeded(ApprovalRequest approvalRequest, DateTime now)
    {
        if (approvalRequest.Status != ApprovalRequestStatus.Pending)
        {
            return;
        }

        var previousStatus = approvalRequest.Status;
        approvalRequest.Status = ApprovalRequestStatus.Started;
        AddRequestStatusLog(approvalRequest, now, previousStatus, ApprovalRequestStatus.Started);
    }

    private static void SkipPendingTasks(IEnumerable<ApprovalRequestTask> tasks, DateTime timestamp)
    {
        foreach (var task in tasks.Where(t => t.Status == ApprovalRequestTaskStatus.Pending))
        {
            var previousStatus = task.Status;
            task.Status = ApprovalRequestTaskStatus.Skipped;
            AddTaskStatusLog(task, SystemActor, timestamp, previousStatus, ApprovalRequestTaskStatus.Skipped, task.Comment);
        }
    }

    private static IEnumerable<ApprovalRequestTask> GetTasks(ApprovalRequest approvalRequest)
    {
        return approvalRequest.Steps.SelectMany(step => step.Tasks);
    }

    private async Task NotifyApproversAsync(
        IEnumerable<ApprovalRequestTask> tasks,
        ApprovalRequestApproverNotification notification,
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
            .GroupBy(t => t.ApproverEmail, StringComparer.OrdinalIgnoreCase)
            .Select(group => new
            {
                Email = group.Key,
                UserId = group.Select(t => t.ApproverUserId).FirstOrDefault(id => !string.IsNullOrWhiteSpace(id))
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

    private static NotificationType GetNotificationType(ApprovalRequestApproverNotification notification)
    {
        return notification switch
        {
            ApprovalRequestApproverNotification.Cancelled => NotificationType.ApprovalRequestCancelled,
            _ => NotificationType.ApprovalRequestTaskCreated
        };
    }

    private ApproverNotificationTemplate GetApproverNotificationTemplate(ApprovalRequestApproverNotification notification)
    {
        var templateName = notification switch
        {
            ApprovalRequestApproverNotification.Cancelled => "ApprovalRequestCancelled",
            _ => "ApprovalRequestSent"
        };

        return new ApproverNotificationTemplate(
            _configuration[$"Email:Templates:{templateName}Heading"]!,
            _configuration[$"Email:Templates:{templateName}Message"]!,
            _configuration[$"Email:Templates:{templateName}LinkText"]!,
            _configuration[$"Email:Templates:{templateName}Subject"]!);
    }

    private Task<ApprovalLogActor> ResolveActorAsync(AppUser user, long tenantId, CancellationToken cancellationToken)
    {
        return _approvalLogActorResolver.ResolveAsync(user, tenantId, cancellationToken);
    }

    private static void AddRequestSubmittedLog(
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

    protected static void AddRequestStatusLog(
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

    private static void AddTaskSubmittedLog(ApprovalRequestTask task, DateTime timestamp)
    {
        AddTaskLog(
            task,
            SystemActor,
            null,
            timestamp,
            ApprovalRequestTaskLogEventType.Submitted,
            new ApprovalRequestTaskSubmittedDetails(task.Status));
    }

    protected static void AddTaskStatusLog(
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

    private enum ApprovalRequestApproverNotification
    {
        Sent,
        Cancelled
    }
}
