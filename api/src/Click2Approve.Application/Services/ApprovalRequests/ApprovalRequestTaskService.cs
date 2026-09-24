using Click2Approve.Domain.Validation;
using Click2Approve.Application.Validation.ApprovalRequests;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;
using FluentValidation;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Implements approval request task operations.
/// </summary>
public class ApprovalRequestTaskService(
    IApprovalRequestTaskRepository approvalRequestTaskRepository,
    IUnitOfWork unitOfWork,
    IApprovalWorkflowService workflowService,
    IApprovalRequestTaskCompletionAttributor completionAttributor,
    IValidator<ApprovalRequestTaskListQueryCommand> approvalRequestTaskListQueryCommandValidator,
    IValidator<CompleteApprovalRequestTaskCommand> completeApprovalRequestTaskCommandValidator,
    IValidator<TaskCompletionContext> taskCompletionValidator) : IApprovalRequestTaskService
{
    private readonly IValidator<ApprovalRequestTaskListQueryCommand> _approvalRequestTaskListQueryCommandValidator =
        approvalRequestTaskListQueryCommandValidator;
    private readonly IValidator<CompleteApprovalRequestTaskCommand> _completeApprovalRequestTaskCommandValidator =
        completeApprovalRequestTaskCommandValidator;
    private readonly IValidator<TaskCompletionContext> _taskCompletionValidator = taskCompletionValidator;
    private readonly IApprovalRequestTaskRepository _approvalRequestTaskRepository = approvalRequestTaskRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IApprovalWorkflowService _workflowService = workflowService;
    private readonly IApprovalRequestTaskCompletionAttributor _completionAttributor = completionAttributor;

    /// <summary>
    /// Lists approval request tasks.
    /// </summary>
    public async Task<GridPageResult<ApprovalRequestTaskListItemResult>> ListAsync(
        AppUser user,
        ApprovalRequestTaskListQueryCommand query,
        CancellationToken cancellationToken)
    {
        await _approvalRequestTaskListQueryCommandValidator.ValidateAndThrowAsync(query, cancellationToken);
        return await _approvalRequestTaskRepository.ListAsync(user, query, cancellationToken);
    }

    /// <summary>
    /// Gets a task with the request data the assignee is authorized to view.
    /// </summary>
    public async Task<ApprovalRequestTaskDetailsResult> GetAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        return await _approvalRequestTaskRepository.GetAsync(user, globalId, cancellationToken)
            ?? throw new NotFoundException("Approval request task was not found.");
    }

    /// <summary>
    /// Completes an approval request task.
    /// </summary>
    public async Task CompleteAsync(AppUser user, CompleteApprovalRequestTaskCommand payload, CancellationToken cancellationToken)
    {
        await _completeApprovalRequestTaskCommandValidator.ValidateAndThrowAsync(payload, cancellationToken);
        var approvalRequestTask = await _approvalRequestTaskRepository.GetForCompletionAsync(user, payload.GlobalId, cancellationToken)
            ?? throw new NotFoundException("Approval request task was not found.");
        await _taskCompletionValidator.ValidateAndThrowAsync(
            new TaskCompletionContext(approvalRequestTask, payload), cancellationToken);
        var now = DateTime.UtcNow;
        ApplyCompletionDetails(approvalRequestTask, payload);

        approvalRequestTask.Status = ApprovalRequestTaskStatus.Completed;
        approvalRequestTask.Result = payload.Result;
        approvalRequestTask.CompletedAt = now;
        approvalRequestTask.Comment = payload.Comment;
        await _completionAttributor.AttributeAsync(user, approvalRequestTask, cancellationToken);

        await _workflowService.CompleteTaskAsync(approvalRequestTask, now, cancellationToken);
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
        approvalRequestTask.AssigneeIpAddress = TrimToLength(payload.AssigneeIpAddress, FieldLimits.IpAddress);
        approvalRequestTask.AssigneeBrowserData = TrimToLength(payload.AssigneeBrowserData, FieldLimits.Details);
        if (!payload.Result || !approvalRequestTask.IsElectronicSignatureRequired)
        {
            return;
        }

        var legalName = (payload.AssigneeLegalName ?? string.Empty).Trim();
        var signatureJson = (payload.AssigneeSignatureJson ?? string.Empty).Trim();
        approvalRequestTask.AssigneeLegalName = legalName;
        approvalRequestTask.AssigneeRepresentationDetails = TrimToLength(payload.AssigneeRepresentationDetails, FieldLimits.Details);
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
