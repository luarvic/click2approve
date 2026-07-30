using Click2Approve.Application.Models.Auxiliary.ApprovalRequests;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Application.Persistence;
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
        var task = await _approvalRequestTaskRepository.GetAsync(user, globalId, cancellationToken);
        var approvalRequest = await _approvalRequestTaskRepository.GetRequestForTaskAsync(user, globalId, cancellationToken);
        var approverGlobalIdMaps = approvalRequest is null
            ? ApprovalRequestApproverGlobalIdMaps.Empty
            : await _approverGlobalIdResolver.ResolveAsync(approvalRequest, cancellationToken);
        return ApprovalRequestMapper.MapTaskDetail(task, approvalRequest, approverGlobalIdMaps);
    }

    /// <summary>
    /// Completes an approval request task.
    /// </summary>
    public async Task CompleteAsync(AppUser user, ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken)
    {
        var approvalRequestTask = await _approvalRequestTaskRepository.GetForCompletionAsync(user, payload.GlobalId, cancellationToken);
        if (approvalRequestTask.Status != ApprovalRequestTaskStatus.Pending)
        {
            throw new BusinessRuleException("The task has already been completed.");
        }

        var now = DateTime.UtcNow;
        var actor = await _workflowService.ResolveActorAsync(user, approvalRequestTask.TenantId, cancellationToken);
        var previousTaskStatus = approvalRequestTask.Status;
        approvalRequestTask.Status = payload.Status;
        approvalRequestTask.Comment = payload.Comment;
        _workflowService.AddStatusLog(approvalRequestTask, actor, now, previousTaskStatus, payload.Status, payload.Comment);

        if (approvalRequestTask.ApprovalRequest.Status is ApprovalRequestStatus.Pending or ApprovalRequestStatus.Started)
        {
            switch (payload.Status)
            {
                case ApprovalRequestTaskStatus.Rejected:
                    var previousRequestStatus = approvalRequestTask.ApprovalRequest.Status;
                    approvalRequestTask.ApprovalRequest.Status = ApprovalRequestStatus.Rejected;
                    _workflowService.AddStatusLog(
                        approvalRequestTask.ApprovalRequest,
                        now,
                        previousRequestStatus,
                        ApprovalRequestStatus.Rejected);
                    _workflowService.SkipPendingTasks(
                        _workflowService.GetTasks(approvalRequestTask.ApprovalRequest)
                            .Where(task => task.Id != approvalRequestTask.Id),
                        now);
                    break;
                case ApprovalRequestTaskStatus.Approved:
                    await _workflowService.AdvanceAsync(approvalRequestTask, actor, now, cancellationToken);
                    _workflowService.StartRequestIfNeeded(approvalRequestTask.ApprovalRequest, now);
                    break;
                default:
                    throw new BusinessRuleException("A task can only be approved or rejected.");
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
}
