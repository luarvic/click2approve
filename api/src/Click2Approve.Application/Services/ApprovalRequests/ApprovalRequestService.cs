using Click2Approve.Application.Extensions;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Implements approval request owner operations.
/// </summary>
public class ApprovalRequestService(
    IApprovalRequestRepository approvalRequestRepository,
    ITenantRepository tenantRepository,
    IUserFileRepository userFileRepository,
    IUnitOfWork unitOfWork,
    IApprovalRequestAssigneeGlobalIdResolver assigneeGlobalIdResolver,
    IApprovalWorkflowService workflowService,
    ITenantContext tenantContext,
    IConfiguration configuration) : IApprovalRequestService
{
    protected readonly IApprovalRequestRepository _approvalRequestRepository = approvalRequestRepository;
    protected readonly IUnitOfWork _unitOfWork = unitOfWork;
    protected readonly IApprovalWorkflowService _workflowService = workflowService;

    private readonly IUserFileRepository _userFileRepository = userFileRepository;
    private readonly ITenantRepository _tenantRepository = tenantRepository;
    private readonly IApprovalRequestAssigneeGlobalIdResolver _assigneeGlobalIdResolver = assigneeGlobalIdResolver;
    private readonly ITenantContext _tenantContext = tenantContext;
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Creates a new approval request.
    /// </summary>
    public async Task<Guid> SubmitAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken)
    {
        var title = (payload.Title ?? string.Empty).Trim();
        if (title.Length == 0)
        {
            throw new BusinessRuleException("Title is required.");
        }

        await CheckLimitationsAsync(user, payload, cancellationToken);

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
        var tenant = await _tenantRepository.GetAsync(tenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant was not found.");
        var creator = await ResolveCreatorAsync(user, tenantId, cancellationToken);
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
            CreatedByEmployeeId = creator.EmployeeId,
            CreatedByDisplayName = creator.DisplayName,
            OrganizationDisplayName = tenant.BusinessName
        }, cancellationToken);
        foreach (var requestFile in newApprovalRequest.RequestFiles)
        {
            requestFile.ApprovalRequest = newApprovalRequest;
        }

        var assigneeResolutions = await _workflowService.ResolveAssigneesAsync(newApprovalRequest, payload.Steps, cancellationToken);

        var submittedTasks = await _workflowService.CreateTasksForStepAsync(
            newApprovalRequest,
            steps.MinBy(step => step.Sequence)!,
            assigneeResolutions,
            now,
            cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _workflowService.NotifyAssigneesSentAsync(submittedTasks, cancellationToken);
        return newApprovalRequest.GlobalId;
    }

    /// <summary>
    /// Cancels an approval request.
    /// </summary>
    public async Task CancelAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var approvalRequest = await _approvalRequestRepository.GetForUpdateAsync(user, globalId, cancellationToken)
            ?? throw new NotFoundException("Approval request was not found.");
        if (approvalRequest.Status is not (ApprovalRequestStatus.Pending or ApprovalRequestStatus.Started))
        {
            throw new BusinessRuleException("The approval request cannot be cancelled.");
        }

        var now = DateTime.UtcNow;
        approvalRequest.Status = ApprovalRequestStatus.Canceled;
        approvalRequest.CompletedAt = now;
        var notifiedTasks = _workflowService.GetTasks(approvalRequest)
            .Where(task => task.Status == ApprovalRequestTaskStatus.Pending)
            .ToList();
        _workflowService.CancelPendingTasks(notifiedTasks, now);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _workflowService.NotifyAssigneesCancelledAsync(notifiedTasks, approvalRequest, cancellationToken);
    }

    /// <summary>
    /// Lists approval requests of the user.
    /// </summary>
    public async Task<List<ApprovalRequestListItemDto>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var approvalRequests = await _approvalRequestRepository.ListAsync(user, cancellationToken);
        return [.. approvalRequests.Select(ApprovalRequestMapper.MapApprovalRequestListItem)];
    }

    /// <summary>
    /// Gets an approval request with all data required by its editor.
    /// </summary>
    public async Task<ApprovalRequestDto> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var approvalRequest = await _approvalRequestRepository.GetAsync(user, globalId, cancellationToken)
            ?? throw new NotFoundException("Approval request was not found.");
        var assigneeGlobalIdMaps = await _assigneeGlobalIdResolver.ResolveAsync(approvalRequest, cancellationToken);
        return ApprovalRequestMapper.MapApprovalRequest(approvalRequest, assigneeGlobalIdMaps);
    }

    protected virtual Task<ApprovalRequestCreator> ResolveCreatorAsync(
        AppUser user,
        long tenantId,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(new ApprovalRequestCreator(null, user.NormalizedEmailOrEmpty()));
    }

    /// <summary>
    /// Contains resolved creator information for an approval request.
    /// </summary>
    protected sealed record ApprovalRequestCreator(long? EmployeeId, string DisplayName);

    private async Task CheckLimitationsAsync(AppUser user, ApprovalRequestSubmitDto payload, CancellationToken cancellationToken)
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

        var maxAssigneesPerRequest = _configuration.GetValue<int>("Limitations:MaxAssigneesPerRequest");
        if (maxAssigneesPerRequest > 0)
        {
            var assigneeCount = payload.Steps.Sum(step => step.Assignees.Count);
            if (assigneeCount > maxAssigneesPerRequest)
            {
                throw new LimitExceededException(
                $"The maximum number of assignees ({maxAssigneesPerRequest}) has been exceeded.");
            }
        }
    }

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

    private static List<ApprovalRequestStep> BuildSteps(List<ApprovalRequestStepSubmitDto> stepDtos)
    {
        if (stepDtos.Count == 0)
        {
            throw new BusinessRuleException("Specify one or more approval steps.");
        }

        return [.. stepDtos
            .OrderBy(step => step.Sequence)
            .Select((stepDto, index) =>
            {
                if (stepDto.Assignees.Count == 0)
                {
                    throw new BusinessRuleException("Each approval step must have one or more assignees.");
                }

                return BuildStep(stepDto, index + 1);
            })];
    }

    private static ApprovalRequestStep BuildStep(ApprovalRequestStepSubmitDto stepDto, int sequence)
    {
        if (stepDto.Assignees.Count == 0)
        {
            throw new BusinessRuleException("Each approval step must have one or more assignees.");
        }

        return new ApprovalRequestStep
        {
            Sequence = sequence,
            Mode = stepDto.Mode,
            Action = stepDto.Action,
            Assignees = [.. stepDto.Assignees.Select(BuildAssignee)],
            ApprovalRequest = null!,
            Tasks = []
        };
    }

    private static ApprovalRequestStepAssignee BuildAssignee(ApprovalRequestAssigneeSubmitDto assignee)
    {
        return new ApprovalRequestStepAssignee
        {
            Type = assignee.Type,
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
                || !stepsBySequence.TryGetValue(visibilityDto.AssigneeStepSequence, out var assigneeStep)
                || visibilityDto.AssigneeIndex < 0
                || visibilityDto.AssigneeIndex >= assigneeStep.Assignees.Count)
            {
                throw new BusinessRuleException("Step visibility contains an invalid step or assignee.");
            }

            var assignee = assigneeStep.Assignees[visibilityDto.AssigneeIndex];
            var assigneeIsAssignedToStep = step.Assignees.Contains(assignee);
            step.StepVisibilities.Add(new ApprovalRequestStepVisibility
            {
                ApprovalRequestStep = step,
                ApprovalRequestStepAssignee = assignee,
                IsVisible = assigneeIsAssignedToStep || visibilityDto.IsVisible
            });
        }
    }
}
