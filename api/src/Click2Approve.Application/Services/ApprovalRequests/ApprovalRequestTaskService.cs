using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Implements approval request task operations.
/// </summary>
public class ApprovalRequestTaskService(
    IApprovalRequestTaskRepository approvalRequestTaskRepository,
    IUnitOfWork unitOfWork,
    IApprovalRequestApproverGlobalIdResolver approverGlobalIdResolver,
    IApprovalWorkflowService workflowService) : IApprovalRequestTaskService
{
    private readonly IApprovalRequestTaskRepository _approvalRequestTaskRepository = approvalRequestTaskRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IApprovalRequestApproverGlobalIdResolver _approverGlobalIdResolver = approverGlobalIdResolver;
    private readonly IApprovalWorkflowService _workflowService = workflowService;

    /// <summary>
    /// Lists approval request tasks.
    /// </summary>
    public async Task<List<ApprovalRequestTaskListItemDto>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tasks = await _approvalRequestTaskRepository.ListAsync(user, cancellationToken);
        return [.. tasks.Select(ApprovalRequestMapper.MapTaskListItem)];
    }

    /// <summary>
    /// Gets a task with the request data the approver is authorized to view.
    /// </summary>
    public async Task<ApprovalRequestTaskDetailDto> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var task = await _approvalRequestTaskRepository.GetAsync(user, globalId, cancellationToken)
            ?? throw new NotFoundException("Approval request task was not found.");
        var approvalRequest = await _approvalRequestTaskRepository.GetRequestForTaskAsync(user, globalId, cancellationToken)
            ?? throw new NotFoundException("Approval request task was not found.");
        var approverGlobalIdMaps = await _approverGlobalIdResolver.ResolveAsync(approvalRequest, cancellationToken);
        return ApprovalRequestMapper.MapTaskDetail(task, approvalRequest, approverGlobalIdMaps);
    }

    /// <summary>
    /// Completes an approval request task.
    /// </summary>
    public async Task CompleteAsync(AppUser user, ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken)
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

        if (approvalRequestTask.ApprovalRequest.Status is ApprovalRequestStatus.Pending or ApprovalRequestStatus.Started)
        {
            switch (approvalRequestTask.Result)
            {
                case false:
                    approvalRequestTask.ApprovalRequest.Status = ApprovalRequestStatus.Completed;
                    approvalRequestTask.ApprovalRequest.Result = false;
                    approvalRequestTask.ApprovalRequest.CompletedAt = now;
                    _workflowService.SkipPendingTasks(
                        _workflowService.GetTasks(approvalRequestTask.ApprovalRequest)
                            .Where(task => task.Id != approvalRequestTask.Id),
                        now);
                    break;
                case true:
                    await _workflowService.AdvanceAsync(approvalRequestTask, now, cancellationToken);
                    _workflowService.StartRequestIfNeeded(approvalRequestTask.ApprovalRequest, now);
                    break;
                default:
                    throw new BusinessRuleException("A task can only be completed with a positive or negative result.");
            }
        }

        await _workflowService.NotifyRequesterReviewedAsync(user, approvalRequestTask, cancellationToken);
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
        ApprovalRequestTaskCompleteDto payload)
    {
        approvalRequestTask.ApproverIpAddress = TrimToLength(payload.ApproverIpAddress, 128);
        approvalRequestTask.ApproverBrowserData = TrimToLength(payload.ApproverBrowserData, 1024);
        if (approvalRequestTask.Action != ApprovalRequestTaskAction.Sign)
        {
            return;
        }

        var legalName = (payload.ApproverLegalName ?? string.Empty).Trim();
        var signatureJson = (payload.ApproverSignatureJson ?? string.Empty).Trim();
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

        approvalRequestTask.ApproverLegalName = TrimToLength(legalName, 255);
        approvalRequestTask.ApproverSignatureJson = signatureJson;
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
