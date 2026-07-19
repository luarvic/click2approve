namespace Click2Approve.Domain.Models;

/// <summary>
/// Describes an approval request status change.
/// </summary>
public sealed record ApprovalRequestStatusChangedDetails(
    ApprovalRequestStatus? PreviousStatus,
    ApprovalRequestStatus Status);
