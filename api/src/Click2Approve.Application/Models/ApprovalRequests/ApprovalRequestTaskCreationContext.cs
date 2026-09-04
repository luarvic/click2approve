using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.ApprovalRequests;

/// <summary>Provides newly created workflow tasks for validation.</summary>
public sealed record ApprovalRequestTaskCreationContext(
    ApprovalRequest ApprovalRequest,
    IReadOnlyCollection<ApprovalRequestTask> Tasks);
