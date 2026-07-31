using Click2Approve.Application.Models.Auxiliary.ApprovalRequests;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Defines workflow operations shared by approval request and approval task use cases.
/// </summary>
public interface IApprovalWorkflowService
{
    ApprovalLogActor SystemActor { get; }

    Task<ApprovalLogActor> ResolveActorAsync(AppUser user, long tenantId, CancellationToken cancellationToken);

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
        ApprovalLogActor actor,
        DateTime timestamp,
        CancellationToken cancellationToken);

    void StartRequestIfNeeded(ApprovalRequest approvalRequest, DateTime timestamp);

    void SkipPendingTasks(IEnumerable<ApprovalRequestTask> tasks, DateTime timestamp);

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

    void AddSubmittedLog(
        ApprovalRequest approvalRequest,
        ApprovalLogActor actor,
        DateTime timestamp);

    void AddStatusLog(
        ApprovalRequest approvalRequest,
        DateTime timestamp,
        ApprovalRequestStatus? previousStatus,
        ApprovalRequestStatus status);

    void AddStatusLog(
        ApprovalRequestTask task,
        ApprovalLogActor actor,
        DateTime timestamp,
        ApprovalRequestTaskStatus? previousStatus,
        ApprovalRequestTaskStatus status,
        string? comment,
        string? ipAddress = null,
        string? browserData = null,
        string? legalFirstName = null,
        string? legalLastName = null,
        DateOnly? dateOfBirth = null,
        bool? signatureCaptured = null);
}
