using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.ApprovalRequests;

/// <summary>
/// Defines workflow operations shared by approval request and approval task use cases.
/// </summary>
public interface IApprovalWorkflowService
{
    Task CreateInitialTasksAsync(
        ApprovalRequest approvalRequest,
        List<ApprovalRequestStepCommand> submittedSteps,
        DateTime timestamp,
        CancellationToken cancellationToken);

    Task CompleteAsync(
        ApprovalRequestTask approvalRequestTask,
        DateTime timestamp,
        CancellationToken cancellationToken);

    Task CancelRequestAsync(
        ApprovalRequest approvalRequest,
        DateTime timestamp,
        CancellationToken cancellationToken);

    void CancelPendingTasks(IEnumerable<ApprovalRequestTask> tasks, DateTime timestamp);
}
