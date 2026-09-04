using Click2Approve.Application.Models.ApprovalRequests;
using Click2Approve.Application.Models.Commands.Notifications;
using Click2Approve.Domain.Models;
using FluentValidation;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Implements shared approval workflow operations.
/// </summary>
public class ApprovalWorkflowService(
    IApprovalRequestTaskRepository approvalRequestTaskRepository,
    IAssigneeResolver assigneeResolver,
    INotificationService notificationService,
    IValidator<ApprovalRequestTaskCreationContext> taskCreationValidator) : IApprovalWorkflowService
{
    private readonly IApprovalRequestTaskRepository _approvalRequestTaskRepository = approvalRequestTaskRepository;
    private readonly IAssigneeResolver _assigneeResolver = assigneeResolver;
    private readonly INotificationService _notificationService = notificationService;
    private readonly IValidator<ApprovalRequestTaskCreationContext> _taskCreationValidator = taskCreationValidator;

    public virtual async Task CreateInitialTasksAsync(
        ApprovalRequest approvalRequest,
        List<ApprovalRequestStepCommand> submittedSteps,
        DateTime timestamp,
        CancellationToken cancellationToken)
    {
        var assigneeResolutions = await ResolveAssigneesAsync(approvalRequest, submittedSteps, cancellationToken);
        await CreateTasksForStepAsync(
            approvalRequest,
            approvalRequest.Steps.MinBy(step => step.Sequence)!,
            assigneeResolutions,
            timestamp,
            cancellationToken);
    }

    public virtual async Task CompleteTaskAsync(
        ApprovalRequestTask approvalRequestTask,
        DateTime timestamp,
        CancellationToken cancellationToken)
    {
        var approvalRequest = approvalRequestTask.ApprovalRequest;
        var stepCompleted = false;
        if (approvalRequest.Status is ApprovalRequestStatus.Pending or ApprovalRequestStatus.Started)
        {
            switch (approvalRequestTask.Result)
            {
                case false:
                    approvalRequest.Status = ApprovalRequestStatus.Completed;
                    approvalRequest.Result = false;
                    approvalRequest.CompletedAt = timestamp;
                    SkipPendingTasks(
                        GetTasks(approvalRequest).Where(task => task.Id != approvalRequestTask.Id),
                        timestamp);
                    break;
                case true:
                    stepCompleted = await AdvanceAsync(approvalRequestTask, timestamp, cancellationToken);
                    StartRequestIfNeeded(approvalRequest);
                    break;
                default:
                    throw new InvalidOperationException("A completed approval request task must have a result.");
            }
        }

        if (approvalRequest.Status == ApprovalRequestStatus.Completed)
        {
            await SendRequestCompletedNotificationAsync(approvalRequest, cancellationToken);
        }
        else if (stepCompleted)
        {
            await SendStepCompletedNotificationAsync(approvalRequestTask, cancellationToken);
        }
    }

    public virtual async Task CancelRequestAsync(
        ApprovalRequest approvalRequest,
        DateTime timestamp,
        CancellationToken cancellationToken)
    {
        var cancelledTasks = GetTasks(approvalRequest)
            .Where(task => task.Status == ApprovalRequestTaskStatus.Pending)
            .ToList();
        CancelPendingTasks(cancelledTasks, timestamp);
        await SendSystemCompletedTaskNotificationsAsync(cancelledTasks, approvalRequest, cancellationToken);
    }

    public void CancelPendingTasks(IEnumerable<ApprovalRequestTask> tasks, DateTime timestamp)
    {
        foreach (var task in tasks.Where(task => task.Status == ApprovalRequestTaskStatus.Pending))
        {
            task.Status = ApprovalRequestTaskStatus.Canceled;
            task.CompletedAt = timestamp;
        }
    }

    private async Task<Dictionary<ApprovalRequestStepAssignee, List<AssigneeResolution>>> ResolveAssigneesAsync(
        ApprovalRequest approvalRequest,
        List<ApprovalRequestStepCommand> submittedSteps,
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

        ApprovalRequestAssigneeCommand? GetSubmittedAssignee(int sequence, int index)
        {
            return submittedStepsBySequence.TryGetValue(sequence, out var submittedStep)
                && index < submittedStep.Assignees.Count
                    ? submittedStep.Assignees[index]
                    : null;
        }
    }

    private async Task<List<ApprovalRequestTask>> CreateTasksForStepAsync(
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

        await _taskCreationValidator.ValidateAndThrowAsync(
            new ApprovalRequestTaskCreationContext(approvalRequest, tasks), cancellationToken);
        await CreateTaskCreatedEventsAsync(tasks, cancellationToken);
        return tasks;
    }

    private async Task<bool> AdvanceAsync(
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
            return false;
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
            return true;
        }

        await CreateTasksForStepAsync(
            approvalRequest,
            nextStep,
            assigneeResolutions: null,
            timestamp,
            cancellationToken);
        return true;
    }

    private static void StartRequestIfNeeded(ApprovalRequest approvalRequest)
    {
        if (approvalRequest.Status != ApprovalRequestStatus.Pending)
        {
            return;
        }

        approvalRequest.Status = ApprovalRequestStatus.Started;
    }

    private static void SkipPendingTasks(IEnumerable<ApprovalRequestTask> tasks, DateTime timestamp)
    {
        foreach (var task in tasks.Where(task => task.Status == ApprovalRequestTaskStatus.Pending))
        {
            task.Status = ApprovalRequestTaskStatus.Skipped;
            task.CompletedAt = timestamp;
        }
    }

    private static IEnumerable<ApprovalRequestTask> GetTasks(ApprovalRequest approvalRequest)
    {
        return approvalRequest.Steps.SelectMany(step => step.Tasks);
    }

    private async Task CreateTaskCreatedEventsAsync(
        IEnumerable<ApprovalRequestTask> tasks,
        CancellationToken cancellationToken)
    {
        await _notificationService.SendAsync(
            [.. tasks.Select(task => new NotificationCommand(
                NotificationType.ApprovalRequestTaskCreated,
                task.TenantId,
                task.GlobalId,
                CreateSummary(task.GlobalId, task.Title),
                [new NotificationRecipient(task.AssigneeUserId)]))],
            cancellationToken);
    }

    private async Task SendSystemCompletedTaskNotificationsAsync(
        IEnumerable<ApprovalRequestTask> tasks,
        ApprovalRequest approvalRequest,
        CancellationToken cancellationToken)
    {
        await _notificationService.SendAsync(
            [.. tasks.GroupBy(task => new { task.AssigneeUserId, task.TenantId })
                .Select(group => new NotificationCommand(
                    NotificationType.ApprovalRequestTaskCompleted,
                    group.Key.TenantId,
                    approvalRequest.GlobalId,
                    CreateSummary(approvalRequest.GlobalId, approvalRequest.Title),
                    [new NotificationRecipient(group.Key.AssigneeUserId)]))],
            cancellationToken);
    }

    private Task SendStepCompletedNotificationAsync(
        ApprovalRequestTask approvalRequestTask,
        CancellationToken cancellationToken)
    {
        var approvalRequest = approvalRequestTask.ApprovalRequest;
        return _notificationService.SendAsync(
            [new NotificationCommand(
                NotificationType.ApprovalRequestStepCompleted,
                approvalRequest.TenantId,
                approvalRequest.GlobalId,
                CreateSummary(approvalRequest.GlobalId, approvalRequest.Title),
                [new NotificationRecipient(approvalRequest.CreatedByUserId)])],
            cancellationToken);
    }

    private Task SendRequestCompletedNotificationAsync(
        ApprovalRequest approvalRequest,
        CancellationToken cancellationToken) =>
        _notificationService.SendAsync(
            [new NotificationCommand(
                NotificationType.ApprovalRequestCompleted,
                approvalRequest.TenantId,
                approvalRequest.GlobalId,
                CreateSummary(approvalRequest.GlobalId, approvalRequest.Title),
                [new NotificationRecipient(approvalRequest.CreatedByUserId)])],
            cancellationToken);

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
                AssigneeEmployeeId = resolution.AssigneeEmployeeId,
                AssigneeUser = resolution.AssigneeUser,
                AssigneeUserId = resolution.AssigneeUser.Id,
                AssigneeDisplayName = resolution.AssigneeDisplayName,
                OrganizationDisplayName = approvalRequest.OrganizationDisplayName,
                TenantId = resolution.TenantId,
                RevisionNumber = approvalRequest.RevisionNumber,
                Action = step.Action,
                Instructions = step.Instructions,
                IsAttachmentRequired = step.IsAttachmentRequired,
                IsCommentRequired = step.IsCommentRequired,
                IsElectronicSignatureRequired = step.IsElectronicSignatureRequired,
                Status = ApprovalRequestTaskStatus.Pending,
                CreatedAt = timestamp
            }, cancellationToken);
            step.Tasks.Add(task);
            tasks.Add(task);
        }

        return tasks;
    }

    private static string CreateSummary(Guid globalId, string title) =>
        $"#{globalId.ToString()[..5]} {title}";
}
