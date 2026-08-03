using Click2Approve.Application.Models.Auxiliary.ApprovalRequests;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Defines workflow operations shared by approval request and approval task use cases.
/// </summary>
public interface IApprovalWorkflowService
{
    Task<Dictionary<ApprovalRequestStepApprover, List<ApprovalRecipientResolution>>> ResolveApproversAsync(
        ApprovalRequest approvalRequest,
        List<ApprovalRequestStepSubmitDto> submittedSteps,
        CancellationToken cancellationToken);

    Task<List<ApprovalRequestTask>> CreateTasksForStepAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        DateTime timestamp,
        CancellationToken cancellationToken);

    Task<List<ApprovalRequestTask>> CreateTasksForStepAsync(
        ApprovalRequest approvalRequest,
        ApprovalRequestStep step,
        IReadOnlyDictionary<ApprovalRequestStepApprover, List<ApprovalRecipientResolution>>? approverResolutions,
        DateTime timestamp,
        CancellationToken cancellationToken);

    Task AdvanceAsync(
        ApprovalRequestTask approvalRequestTask,
        DateTime timestamp,
        CancellationToken cancellationToken);

    void StartRequestIfNeeded(ApprovalRequest approvalRequest, DateTime timestamp);

    void SkipPendingTasks(IEnumerable<ApprovalRequestTask> tasks, DateTime timestamp);

    void CancelPendingTasks(IEnumerable<ApprovalRequestTask> tasks, DateTime timestamp);

    IEnumerable<ApprovalRequestTask> GetTasks(ApprovalRequest approvalRequest);

    Task NotifyApproversSentAsync(
        IEnumerable<ApprovalRequestTask> tasks,
        CancellationToken cancellationToken);

    Task NotifyApproversCancelledAsync(
        IEnumerable<ApprovalRequestTask> tasks,
        ApprovalRequest approvalRequest,
        CancellationToken cancellationToken);

    Task NotifyRequesterReviewedAsync(
        AppUser reviewer,
        ApprovalRequestTask approvalRequestTask,
        CancellationToken cancellationToken);

}
