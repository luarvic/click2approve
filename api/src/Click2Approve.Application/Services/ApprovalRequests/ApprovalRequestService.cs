using Click2Approve.Domain.Exceptions;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;
using Click2Approve.Application.Models.Auxiliary;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Application.Services.AuditLogs;
using Click2Approve.Application.Services.Email;
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
    IAuditLogService auditLogService,
    IEmailService emailService,
    IApprovalRecipientResolver approvalRecipientResolver,
    ITenantContext tenantContext,
    IConfiguration configuration) : IApprovalRequestService
{
    private readonly IApprovalRequestRepository _approvalRequestRepository = approvalRequestRepository;
    private readonly IApprovalRequestTaskRepository _approvalRequestTaskRepository = approvalRequestTaskRepository;
    private readonly IUserFileRepository _userFileRepository = userFileRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IAuditLogService _auditLogService = auditLogService;
    private readonly IEmailService _emailService = emailService;
    private readonly IApprovalRecipientResolver _approvalRecipientResolver = approvalRecipientResolver;
    private readonly ITenantContext _tenantContext = tenantContext;
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Creates a new approval request.
    /// </summary>
    public async Task SubmitApprovalRequestAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken)
    {
        var title = (payload.Title ?? string.Empty).Trim();
        if (title.Length == 0)
        {
            throw new BusinessRuleException("Title is required.");
        }

        await CheckLimitations(user, payload, cancellationToken);

        var userFiles = await _userFileRepository.ListAsync(user, payload.UserFileIds, cancellationToken);
        if (userFiles.Count == 0)
        {
            throw new BusinessRuleException("Add one or more files.");
        }

        var now = DateTime.UtcNow;
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        var steps = BuildSteps(payload.Steps);

        var newApprovalRequest = await _approvalRequestRepository.AddAsync(new ApprovalRequest
        {
            Title = title,
            UserFiles = userFiles,
            Steps = steps,
            ApproveBy = payload.ApproveBy,
            CreatedAt = now,
            Comment = payload.Comment,
            Status = ApprovalRequestStatus.Submitted,
            TenantId = tenantId,
            AuthorUserId = user.Id,
            AuthorUser = user,
            AuthorEmail = user.NormalizedEmail!,
            ClonedFromApprovalRequestId = payload.ClonedFromApprovalRequestId,
            Tasks = []
        }, cancellationToken);

        await CreateTasksForStepAsync(newApprovalRequest, steps.MinBy(s => s.Sequence)!, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Add audit log entry.
        await _auditLogService.LogAsync(user,
            now,
            "Submitted approval request",
            newApprovalRequest.ToString(),
            cancellationToken
        );

        await NotifyApproversAsync(newApprovalRequest.Tasks, ApprovalRequestApproverNotification.Sent, cancellationToken);
    }

    /// <summary>
    /// Deletes the approval request.
    /// </summary>
    public async Task DeleteApprovalRequestAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var approvalRequest = await _approvalRequestRepository.GetForDeleteAsync(user, id, cancellationToken);
        var approvalRequestJson = approvalRequest.ToString();
        var notifiedTasks = approvalRequest.Tasks.ToList();
        _approvalRequestRepository.Remove(approvalRequest);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Add audit log entry.
        await _auditLogService.LogAsync(user,
            DateTime.UtcNow,
            "Deleted approval request",
            approvalRequestJson,
            cancellationToken
        );

        await NotifyApproversAsync(notifiedTasks, ApprovalRequestApproverNotification.Deleted, cancellationToken, approvalRequest);
    }

    /// <summary>
    /// Cancels an approval request.
    /// </summary>
    public async Task CancelApprovalRequestAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var approvalRequest = await _approvalRequestRepository.GetForUpdateAsync(user, id, cancellationToken);
        if (approvalRequest.Status is ApprovalRequestStatus.Approved or ApprovalRequestStatus.Rejected or ApprovalRequestStatus.Cancelled)
        {
            throw new BusinessRuleException("The approval request cannot be cancelled.");
        }

        approvalRequest.Status = ApprovalRequestStatus.Cancelled;
        var notifiedTasks = approvalRequest.Tasks.ToList();
        SkipPendingTasks(approvalRequest.Tasks);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _auditLogService.LogAsync(user,
            DateTime.UtcNow,
            "Cancelled approval request",
            approvalRequest.ToString(),
            cancellationToken
        );

        await NotifyApproversAsync(notifiedTasks, ApprovalRequestApproverNotification.Cancelled, cancellationToken);
    }

    /// <summary>
    /// Updates steps that have not passed yet.
    /// </summary>
    public async Task UpdateApprovalRequestStepsAsync(AppUser user, long id, ApprovalRequestStepsUpdateDto payload, CancellationToken cancellationToken)
    {
        var approvalRequest = await _approvalRequestRepository.GetForUpdateAsync(user, id, cancellationToken);
        if (approvalRequest.Status != ApprovalRequestStatus.Submitted)
        {
            throw new BusinessRuleException("Only submitted approval requests can be modified.");
        }

        var orderedStepDtos = payload.Steps
            .OrderBy(s => s.Sequence)
            .Select((step, index) => new SequencedStepDto(step, index + 1))
            .ToList();

        if (orderedStepDtos.Count == 0)
        {
            throw new BusinessRuleException("Specify one or more approval steps.");
        }

        var passedSteps = approvalRequest.Steps
            .Where(StepHasPassed)
            .OrderBy(s => s.Sequence)
            .ToList();
        var currentStep = approvalRequest.Steps
            .Where(s => s.Tasks.Any(t => t.Status == ApprovalRequestTaskStatus.Pending))
            .OrderBy(s => s.Sequence)
            .FirstOrDefault();
        var lockedSteps = passedSteps.Concat(currentStep is null ? [] : [currentStep]).ToList();
        var lockedBoundarySequence = lockedSteps.Count == 0 ? 0 : lockedSteps.Max(s => s.Sequence);

        foreach (var lockedStep in lockedSteps)
        {
            var stepDto = orderedStepDtos.FirstOrDefault(s => s.Step.Id == lockedStep.Id)
                ?? throw new BusinessRuleException("Steps that have already started cannot be removed.");

            if (stepDto.Sequence != lockedStep.Sequence)
            {
                throw new BusinessRuleException("Steps that have already started cannot be reordered.");
            }
        }

        foreach (var passedStep in passedSteps)
        {
            var stepDto = orderedStepDtos.First(s => s.Step.Id == passedStep.Id).Step;
            EnsureStepIsUnchanged(passedStep, stepDto, "Steps that have already passed cannot be modified.");
        }

        var newTasks = new List<ApprovalRequestTask>();
        var removedTasks = new List<ApprovalRequestTask>();
        if (currentStep is not null)
        {
            var currentStepDto = orderedStepDtos.First(s => s.Step.Id == currentStep.Id).Step;
            var taskUpdates = await UpdateCurrentStepApproversAsync(approvalRequest, currentStep, currentStepDto, cancellationToken);
            newTasks.AddRange(taskUpdates.CreatedTasks);
            removedTasks.AddRange(taskUpdates.RemovedTasks);
        }

        var mutableSteps = approvalRequest.Steps
            .Where(s => s.Sequence > lockedBoundarySequence)
            .ToList();
        foreach (var step in mutableSteps)
        {
            approvalRequest.Steps.Remove(step);
        }

        var replacementSteps = orderedStepDtos
            .Where(s => s.Sequence > lockedBoundarySequence)
            .Select(s => BuildStep(s.Step, s.Sequence))
            .ToList();
        approvalRequest.Steps.AddRange(replacementSteps);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await NotifyApproversAsync(newTasks, ApprovalRequestApproverNotification.Sent, cancellationToken);
        await NotifyApproversAsync(removedTasks, ApprovalRequestApproverNotification.Removed, cancellationToken, approvalRequest);
    }

    /// <summary>
    /// Lists the approval requests of the user.
    /// </summary>
    public async Task<List<ApprovalRequest>> ListApprovalRequestsAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _approvalRequestRepository.ListAsync(user, cancellationToken);
    }

    /// <summary>
    /// Lists the approval request tasks.
    /// </summary>
    public async Task<List<ApprovalRequestTask>> ListTasksAsync(AppUser user, ApprovalRequestTaskStatus[] statuses, CancellationToken cancellationToken)
    {
        var tasks = await _approvalRequestTaskRepository.ListAsync(user, statuses, cancellationToken);
        foreach (var task in tasks.Where(t => !t.CanViewRequest))
        {
            RedactApprovalRequestDetails(task.ApprovalRequest);
        }

        return tasks;
    }

    /// <summary>
    /// Completes the approval request task.
    /// </summary>
    public async Task CompleteTaskAsync(AppUser user, ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken)
    {
        var approvalRequestTask = await _approvalRequestTaskRepository.GetForCompletionAsync(user, payload.Id, cancellationToken);
        if (approvalRequestTask.Status != ApprovalRequestTaskStatus.Pending)
        {
            throw new BusinessRuleException("The task has already been completed.");
        }

        // Complete approval request task.
        approvalRequestTask.Status = payload.Status;
        approvalRequestTask.Comment = payload.Comment;
        approvalRequestTask.CompletedAt = DateTime.UtcNow;

        // Calculate and update approval request status.
        if (approvalRequestTask.ApprovalRequest.Status == ApprovalRequestStatus.Submitted)
        {
            switch (payload.Status)
            {
                case ApprovalRequestTaskStatus.Rejected:
                    approvalRequestTask.ApprovalRequest.Status = ApprovalRequestStatus.Rejected;
                    SkipPendingTasks(approvalRequestTask.ApprovalRequest.Tasks.Where(t => t.Id != approvalRequestTask.Id));
                    break;
                case ApprovalRequestTaskStatus.Approved:
                    await AdvanceWorkflowAsync(approvalRequestTask, cancellationToken);
                    break;
                default:
                    throw new BusinessRuleException("A task can only be approved or rejected.");
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
            ToAddress = approvalRequestTask.ApprovalRequest.AuthorEmail.ToLower(),
            Subject = reviewedSubject,
            Body = EmailHelpers.BuildHtmlEmail(
                reviewedHeadingTemplate,
                string.Format(reviewedMessageTemplate,
                    user.Email!.ToLower(),
                    string.Join(", ", approvalRequestTask.ApprovalRequest.UserFiles.Select(f => f.Name))),
                reviewedLink,
                reviewedLinkText)
        }, cancellationToken);

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

    private static void RedactApprovalRequestDetails(ApprovalRequest approvalRequest)
    {
        approvalRequest.Title = string.Empty;
        approvalRequest.AuthorUserId = string.Empty;
        approvalRequest.AuthorUser = null!;
        approvalRequest.AuthorEmail = string.Empty;
        approvalRequest.Comment = null;
        approvalRequest.ClonedFromApprovalRequestId = null;
        approvalRequest.ClonedFromApprovalRequest = null;
        approvalRequest.Steps = [];
        approvalRequest.Tasks = [];
    }

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

    private static ApprovalRequestStep BuildStep(ApprovalRequestStepUpdateDto stepDto, int sequence)
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
            Email = approver.Email,
            EmployeeId = approver.EmployeeId,
            TeamId = approver.TeamId,
            DisplayName = approver.DisplayName,
            CanViewRequest = approver.CanViewRequest
        };
    }

    private async Task CreateTasksForStepAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        CancellationToken cancellationToken)
    {
        foreach (var configuredApprover in step.Approvers)
        {
            await CreateTasksForApproverAsync(approvalRequest, step, configuredApprover, cancellationToken);
        }
    }

    private async Task<List<ApprovalRequestTask>> CreateTasksForApproverAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        ApprovalRequestStepApprover configuredApprover,
        CancellationToken cancellationToken)
    {
        var tasks = new List<ApprovalRequestTask>();
        var resolutions = await _approvalRecipientResolver.ResolveAsync(
            approvalRequest,
            step,
            configuredApprover,
            cancellationToken);

        foreach (var resolution in resolutions)
        {
            var task = await _approvalRequestTaskRepository.AddAsync(new ApprovalRequestTask
            {
                Title = approvalRequest.Title,
                ApprovalRequest = approvalRequest,
                ApprovalRequestStep = step,
                ApproverEmail = resolution.ApproverEmail,
                ApproverUserId = resolution.ApproverUserId,
                ApproverDisplayName = resolution.DisplayName,
                CanViewRequest = resolution.CanViewRequest,
                TenantId = resolution.TenantId,
                Status = ApprovalRequestTaskStatus.Pending,
                CreatedAt = DateTime.UtcNow
            }, cancellationToken);
            approvalRequest.Tasks.Add(task);
            step.Tasks.Add(task);
            tasks.Add(task);
        }

        return tasks;
    }

    private async Task<CurrentStepTaskUpdates> UpdateCurrentStepApproversAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep currentStep,
        ApprovalRequestStepUpdateDto currentStepDto,
        CancellationToken cancellationToken)
    {
        if (currentStep.Mode != currentStepDto.Mode)
        {
            throw new BusinessRuleException("The current approval step cannot be modified.");
        }
        if (currentStepDto.Approvers.Count == 0)
        {
            throw new BusinessRuleException("Each approval step must have one or more approvers.");
        }

        var currentApproversById = currentStep.Approvers.ToDictionary(a => a.Id);
        var submittedApproverIds = currentStepDto.Approvers
            .Where(a => a.Id.HasValue)
            .Select(a => a.Id!.Value)
            .ToHashSet();

        foreach (var approverDto in currentStepDto.Approvers.Where(a => a.Id.HasValue))
        {
            if (!currentApproversById.TryGetValue(approverDto.Id!.Value, out var existingApprover))
            {
                throw new BusinessRuleException("The current approval step contains an invalid approver.");
            }

            EnsureApproverIsUnchanged(existingApprover, approverDto, "Existing approvers in the current step cannot be modified.");
        }

        var removedApprovers = currentStep.Approvers
            .Where(a => !submittedApproverIds.Contains(a.Id))
            .ToList();
        var removedTasks = new List<ApprovalRequestTask>();
        foreach (var removedApprover in removedApprovers)
        {
            var tasks = await GetApproverTasksAsync(approvalRequest, currentStep, removedApprover, cancellationToken);
            if (tasks.Any(t => t.Status != ApprovalRequestTaskStatus.Pending))
            {
                throw new BusinessRuleException("Approvers that have already reviewed the current step cannot be removed.");
            }

            removedTasks.AddRange(tasks);
            foreach (var task in tasks)
            {
                _approvalRequestTaskRepository.Remove(task);
                approvalRequest.Tasks.Remove(task);
                currentStep.Tasks.Remove(task);
            }

            currentStep.Approvers.Remove(removedApprover);
        }

        var newTasks = new List<ApprovalRequestTask>();
        foreach (var approverDto in currentStepDto.Approvers.Where(a => !a.Id.HasValue))
        {
            var approver = BuildApprover(approverDto);
            currentStep.Approvers.Add(approver);
            var createdTasks = await CreateTasksForApproverAsync(approvalRequest, currentStep, approver, cancellationToken);
            newTasks.AddRange(createdTasks);
        }

        return new CurrentStepTaskUpdates(newTasks, removedTasks);
    }

    private static void EnsureStepIsUnchanged(
        ApprovalRequestStep step,
        ApprovalRequestStepUpdateDto stepDto,
        string message)
    {
        if (step.Mode != stepDto.Mode || step.Approvers.Count != stepDto.Approvers.Count)
        {
            throw new BusinessRuleException(message);
        }

        foreach (var approver in step.Approvers)
        {
            var approverDto = stepDto.Approvers.FirstOrDefault(a => a.Id == approver.Id)
                ?? throw new BusinessRuleException(message);
            EnsureApproverIsUnchanged(approver, approverDto, message);
        }
    }

    private static void EnsureApproverIsUnchanged(
        ApprovalRequestStepApprover approver,
        ApprovalRequestApproverUpdateDto approverDto,
        string message)
    {
        if (approver.Type != approverDto.Type
            || !string.Equals(approver.Email, approverDto.Email, StringComparison.Ordinal)
            || approver.EmployeeId != approverDto.EmployeeId
            || approver.TeamId != approverDto.TeamId
            || !string.Equals(approver.DisplayName, approverDto.DisplayName, StringComparison.Ordinal)
            || approver.CanViewRequest != approverDto.CanViewRequest)
        {
            throw new BusinessRuleException(message);
        }
    }

    private static bool StepHasPassed(ApprovalRequestStep step)
    {
        return step.Tasks.Count > 0
            && step.Tasks.All(t => t.Status is ApprovalRequestTaskStatus.Approved or ApprovalRequestTaskStatus.Skipped);
    }

    private async Task<List<ApprovalRequestTask>> GetApproverTasksAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        ApprovalRequestStepApprover approver,
        CancellationToken cancellationToken)
    {
        var resolutions = await _approvalRecipientResolver.ResolveAsync(approvalRequest, step, approver, cancellationToken);
        return [.. step.Tasks.Where(task => resolutions.Any(resolution => MatchesResolution(task, resolution)))];
    }

    private static bool MatchesResolution(ApprovalRequestTask task, ApprovalRecipientResolution resolution)
    {
        return task.TenantId == resolution.TenantId
            && string.Equals(task.ApproverEmail, resolution.ApproverEmail, StringComparison.Ordinal)
            && string.Equals(task.ApproverUserId, resolution.ApproverUserId, StringComparison.Ordinal);
    }

    private async Task AdvanceWorkflowAsync(ApprovalRequestTask approvalRequestTask, CancellationToken cancellationToken)
    {
        var approvalRequest = approvalRequestTask.ApprovalRequest;
        var currentStep = approvalRequestTask.ApprovalRequestStep;
        var currentStepTasks = approvalRequest.Tasks
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
            SkipPendingTasks(currentStepTasks.Where(t => t.Id != approvalRequestTask.Id));
        }

        var nextStep = approvalRequest.Steps
            .Where(s => s.Sequence > currentStep.Sequence)
            .OrderBy(s => s.Sequence)
            .FirstOrDefault();

        if (nextStep is null)
        {
            approvalRequest.Status = ApprovalRequestStatus.Approved;
            SkipPendingTasks(approvalRequest.Tasks);
            return;
        }

        await CreateTasksForStepAsync(approvalRequest, nextStep, cancellationToken);
        await NotifyApproversAsync(nextStep.Tasks, ApprovalRequestApproverNotification.Sent, cancellationToken);
    }

    private static void SkipPendingTasks(IEnumerable<ApprovalRequestTask> tasks)
    {
        foreach (var task in tasks.Where(t => t.Status == ApprovalRequestTaskStatus.Pending))
        {
            task.Status = ApprovalRequestTaskStatus.Skipped;
        }
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
        var link = $"{_configuration["UI:BaseUrl"]}/inbox";

        foreach (var email in taskList.Select(t => t.ApproverEmail).Distinct(StringComparer.OrdinalIgnoreCase))
        {

            await _emailService.SendAsync(new EmailMessage
            {
                ToAddress = email.ToLower(),
                Subject = template.Subject,
                Body = EmailHelpers.BuildHtmlEmail(
                    template.Heading,
                    string.Format(template.Message,
                        approvalRequest.AuthorEmail.ToLower(),
                        string.Join(", ", approvalRequest.UserFiles.Select(f => f.Name))),
                    link,
                    template.LinkText)
            }, cancellationToken);
        }
    }

    private ApproverNotificationTemplate GetApproverNotificationTemplate(ApprovalRequestApproverNotification notification)
    {
        var templateName = notification switch
        {
            ApprovalRequestApproverNotification.Cancelled => "ApprovalRequestCancelled",
            ApprovalRequestApproverNotification.Deleted => "ApprovalRequestDeleted",
            ApprovalRequestApproverNotification.Removed => "ApprovalRequestTaskRemoved",
            _ => "ApprovalRequestSent"
        };

        return new ApproverNotificationTemplate(
            _configuration[$"Email:Templates:{templateName}Heading"]!,
            _configuration[$"Email:Templates:{templateName}Message"]!,
            _configuration[$"Email:Templates:{templateName}LinkText"]!,
            _configuration[$"Email:Templates:{templateName}Subject"]!);
    }

    private sealed record SequencedStepDto(ApprovalRequestStepUpdateDto Step, int Sequence);

    private sealed record CurrentStepTaskUpdates(
        List<ApprovalRequestTask> CreatedTasks,
        List<ApprovalRequestTask> RemovedTasks);

    private sealed record ApproverNotificationTemplate(
        string Heading,
        string Message,
        string LinkText,
        string Subject);

    private enum ApprovalRequestApproverNotification
    {
        Sent,
        Deleted,
        Cancelled,
        Removed
    }
}
