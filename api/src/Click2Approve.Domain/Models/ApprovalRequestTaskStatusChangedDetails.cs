namespace Click2Approve.Domain.Models;

/// <summary>
/// Describes an approval request task status change.
/// </summary>
public sealed record ApprovalRequestTaskStatusChangedDetails(
    ApprovalRequestTaskStatus? PreviousStatus,
    ApprovalRequestTaskStatus Status,
    string? Comment);
