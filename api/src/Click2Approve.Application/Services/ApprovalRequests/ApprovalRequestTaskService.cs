using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Implements approval request task operations.
/// </summary>
public class ApprovalRequestTaskService(
    IApprovalRequestTaskRepository approvalRequestTaskRepository,
    IUnitOfWork unitOfWork,
    IApprovalRequestAssigneeGlobalIdResolver assigneeGlobalIdResolver,
    IApprovalWorkflowService workflowService,
    IApprovalRequestTaskCompletionAttributor completionAttributor) : IApprovalRequestTaskService
{
    private readonly IApprovalRequestTaskRepository _approvalRequestTaskRepository = approvalRequestTaskRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IApprovalRequestAssigneeGlobalIdResolver _assigneeGlobalIdResolver = assigneeGlobalIdResolver;
    private readonly IApprovalWorkflowService _workflowService = workflowService;
    private readonly IApprovalRequestTaskCompletionAttributor _completionAttributor = completionAttributor;

    /// <summary>
    /// Lists approval request tasks.
    /// </summary>
    public async Task<List<ApprovalRequestTaskListItemResult>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tasks = await _approvalRequestTaskRepository.ListAsync(user, cancellationToken);
        return [.. tasks.Select(ApprovalRequestMapper.MapTaskListItem)];
    }

    /// <summary>
    /// Gets a task with the request data the assignee is authorized to view.
    /// </summary>
    public async Task<ApprovalRequestTaskDetailsResult> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var taskWithHiddenStepSequences = await _approvalRequestTaskRepository.GetAsync(user, globalId, cancellationToken)
            ?? throw new NotFoundException("Approval request task was not found.");
        var assigneeGlobalIdMaps = await _assigneeGlobalIdResolver.ResolveAsync(
            taskWithHiddenStepSequences.Task.ApprovalRequest,
            cancellationToken);
        return ApprovalRequestMapper.MapTaskDetail(taskWithHiddenStepSequences, assigneeGlobalIdMaps);
    }

    /// <summary>
    /// Completes an approval request task.
    /// </summary>
    public async Task CompleteAsync(AppUser user, CompleteApprovalRequestTaskCommand payload, CancellationToken cancellationToken)
    {
        var approvalRequestTask = await _approvalRequestTaskRepository.GetForCompletionAsync(user, payload.GlobalId, cancellationToken)
            ?? throw new NotFoundException("Approval request task was not found.");
        if (approvalRequestTask.Status != ApprovalRequestTaskStatus.Pending)
        {
            throw new BusinessRuleException("The task has already been completed.");
        }

        var now = DateTime.UtcNow;
        ApplyCompletionDetails(approvalRequestTask, payload);
        if (!payload.Result && string.IsNullOrWhiteSpace(payload.Comment))
        {
            throw new BusinessRuleException("Comment is required.");
        }

        approvalRequestTask.Status = ApprovalRequestTaskStatus.Completed;
        approvalRequestTask.Result = payload.Result;
        approvalRequestTask.CompletedAt = now;
        approvalRequestTask.Comment = payload.Comment;
        await _completionAttributor.AttributeAsync(user, approvalRequestTask, cancellationToken);

        await _workflowService.CompleteAsync(approvalRequestTask, now, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Counts uncompleted approval request tasks.
    /// </summary>
    public async Task<long> CountUncompletedAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _approvalRequestTaskRepository.CountUncompletedAsync(user, cancellationToken);
    }

    private static void ApplyCompletionDetails(
        ApprovalRequestTask approvalRequestTask,
        CompleteApprovalRequestTaskCommand payload)
    {
        approvalRequestTask.AssigneeIpAddress = TrimToLength(payload.AssigneeIpAddress, 128);
        approvalRequestTask.AssigneeBrowserData = TrimToLength(payload.AssigneeBrowserData, 1024);
        if (approvalRequestTask.Action != ApprovalRequestTaskAction.Sign)
        {
            return;
        }

        var legalName = (payload.AssigneeLegalName ?? string.Empty).Trim();
        var signatureJson = (payload.AssigneeSignatureJson ?? string.Empty).Trim();
        if (legalName.Length == 0)
        {
            throw new BusinessRuleException("Legal name is required.");
        }

        if (signatureJson.Length == 0)
        {
            throw new BusinessRuleException("Signature is required.");
        }

        if (signatureJson.Length > 16000)
        {
            throw new BusinessRuleException("Signature is too large.");
        }

        approvalRequestTask.AssigneeLegalName = legalName;
        approvalRequestTask.AssigneeOrganization = payload.AssigneeOrganization;
        approvalRequestTask.AssigneeSignatureJson = signatureJson;
    }

    private static string? TrimToLength(string? value, int maxLength)
    {
        var trimmed = value?.Trim();
        if (string.IsNullOrEmpty(trimmed))
        {
            return null;
        }

        return trimmed.Length <= maxLength ? trimmed : trimmed[..maxLength];
    }
}
