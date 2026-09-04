using Click2Approve.Application.Extensions;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;
using FluentValidation;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Implements approval request owner operations.
/// </summary>
public class ApprovalRequestService(
    IApprovalRequestRepository approvalRequestRepository,
    ITenantRepository tenantRepository,
    IUserFileRepository userFileRepository,
    IUserFileService userFileService,
    IUnitOfWork unitOfWork,
    IApprovalRequestAssigneeGlobalIdResolver assigneeGlobalIdResolver,
    IApprovalWorkflowService workflowService,
    ITenantContext tenantContext,
    IApprovalRequestCompletionAttributor completionAttributor,
    IValidator<ApprovalRequest> approvalRequestDeletionValidator) : IApprovalRequestService
{
    protected readonly IApprovalRequestRepository _approvalRequestRepository = approvalRequestRepository;
    protected readonly IApprovalRequestCompletionAttributor _completionAttributor = completionAttributor;
    protected readonly IUnitOfWork _unitOfWork = unitOfWork;
    protected readonly IApprovalWorkflowService _workflowService = workflowService;

    private readonly IUserFileRepository _userFileRepository = userFileRepository;
    private readonly IUserFileService _userFileService = userFileService;
    private readonly ITenantRepository _tenantRepository = tenantRepository;
    private readonly IApprovalRequestAssigneeGlobalIdResolver _assigneeGlobalIdResolver = assigneeGlobalIdResolver;
    private readonly ITenantContext _tenantContext = tenantContext;
    private readonly IValidator<ApprovalRequest> _approvalRequestDeletionValidator = approvalRequestDeletionValidator;

    /// <summary>
    /// Creates a new approval request.
    /// </summary>
    public virtual async Task<Guid> SubmitAsync(AppUser user, SubmitApprovalRequestCommand payload, CancellationToken cancellationToken)
    {
        await AttachFilesAsync(user, payload.RequestFiles.Select(file => file.UserFileGlobalId), cancellationToken);
        return await CreateAsync(user, payload, cancellationToken);
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
        await _completionAttributor.AttributeAsync(user, approvalRequest, cancellationToken);
        await _workflowService.CancelRequestAsync(approvalRequest, now, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public virtual async Task DeleteAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var approvalRequest = await _approvalRequestRepository.GetForUpdateAsync(user, globalId, cancellationToken)
            ?? throw new NotFoundException("Approval request was not found.");
        await _approvalRequestDeletionValidator.ValidateAndThrowAsync(approvalRequest, cancellationToken);

        foreach (var requestFile in approvalRequest.RequestFiles)
        {
            requestFile.UserFile.ScheduledForDeletionAt = DateTime.UtcNow;
        }

        await _approvalRequestRepository.RemoveAsync(approvalRequest, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Lists approval requests of the user.
    /// </summary>
    public async Task<GridPageResult<ApprovalRequestListItemResult>> ListAsync(
        AppUser user,
        ApprovalRequestListQueryCommand query,
        CancellationToken cancellationToken)
    {
        return await _approvalRequestRepository.ListAsync(user, query, cancellationToken);
    }

    /// <summary>
    /// Gets an approval request with all data required by its editor.
    /// </summary>
    public async Task<ApprovalRequestDetailsResult> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var approvalRequest = await _approvalRequestRepository.GetAsync(user, globalId, cancellationToken)
            ?? throw new NotFoundException("Approval request was not found.");
        var assigneeGlobalIdMaps = await _assigneeGlobalIdResolver.ResolveAsync(approvalRequest, cancellationToken);
        return ApprovalRequestMapper.MapApprovalRequest(approvalRequest, assigneeGlobalIdMaps);
    }

    protected async Task<Guid> CreateAsync(
        AppUser user,
        SubmitApprovalRequestCommand payload,
        CancellationToken cancellationToken)
    {
        var title = (payload.Title ?? string.Empty).Trim();
        if (title.Length == 0)
        {
            throw new BusinessRuleException("Title is required.");
        }

        var userFileGlobalIds = payload.RequestFiles.Select(file => file.UserFileGlobalId).Distinct().ToList();
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

        var newApprovalRequest = await _approvalRequestRepository.AddAsync(new ApprovalRequest
        {
            Title = title,
            RequestFiles = [.. BuildRequestFiles(payload.RequestFiles, userFiles)],
            Steps = steps,
            CreatedAt = now,
            Description = payload.Description,
            Status = ApprovalRequestStatus.Pending,
            TenantId = tenantId,
            CreatedByEmployeeId = creator.EmployeeId,
            CreatedByUserId = user.Id,
            CreatedByUser = user,
            CreatedByDisplayName = creator.DisplayName,
            OrganizationDisplayName = tenant.Type == TenantType.Business ? tenant.BusinessName : string.Empty
        }, cancellationToken);
        foreach (var requestFile in newApprovalRequest.RequestFiles)
        {
            requestFile.ApprovalRequest = newApprovalRequest;
        }

        await _workflowService.CreateInitialTasksAsync(
            newApprovalRequest,
            payload.Steps,
            now,
            cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return newApprovalRequest.GlobalId;
    }

    protected Task AttachFilesAsync(
        AppUser user,
        IEnumerable<Guid> userFileGlobalIds,
        CancellationToken cancellationToken) =>
        _userFileService.AttachAsync(user, [.. userFileGlobalIds], cancellationToken);

    protected virtual Task<ApprovalRequestCreator> ResolveCreatorAsync(
        AppUser user,
        long tenantId,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(new ApprovalRequestCreator(
            EmployeeId: null,
            DisplayName: user.FormatParticipantDisplayName()));
    }

    /// <summary>
    /// Contains resolved creator information for an approval request.
    /// </summary>
    protected sealed record ApprovalRequestCreator(long? EmployeeId, string DisplayName);

    private static IEnumerable<ApprovalRequestFile> BuildRequestFiles(
        IEnumerable<ApprovalRequestFileCommand> submittedFiles,
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

    private static List<ApprovalRequestStep> BuildSteps(List<ApprovalRequestStepCommand> stepCommands)
    {
        if (stepCommands.Count == 0)
        {
            throw new BusinessRuleException("Specify one or more approval steps.");
        }

        return [.. stepCommands
            .OrderBy(step => step.Sequence)
            .Select((stepCommand, index) =>
            {
                if (stepCommand.Assignees.Count == 0)
                {
                    throw new BusinessRuleException("Each approval step must have one or more assignees.");
                }

                return BuildStep(stepCommand, index + 1);
            })];
    }

    private static ApprovalRequestStep BuildStep(ApprovalRequestStepCommand stepCommand, int sequence)
    {
        if (stepCommand.Assignees.Count == 0)
        {
            throw new BusinessRuleException("Each approval step must have one or more assignees.");
        }

        return new ApprovalRequestStep
        {
            Sequence = sequence,
            Mode = stepCommand.Mode,
            Action = stepCommand.Action,
            Instructions = stepCommand.Instructions?.Trim(),
            IsAttachmentRequired = stepCommand.IsAttachmentRequired,
            IsCommentRequired = stepCommand.IsCommentRequired,
            IsElectronicSignatureRequired = stepCommand.IsElectronicSignatureRequired,
            VisibilityMode = stepCommand.VisibilityMode,
            Assignees = [.. stepCommand.Assignees.Select(BuildAssignee)],
            ApprovalRequest = null!,
            Tasks = []
        };
    }

    private static ApprovalRequestStepAssignee BuildAssignee(ApprovalRequestAssigneeCommand assignee)
    {
        return new ApprovalRequestStepAssignee
        {
            Type = assignee.Type,
        };
    }

}
