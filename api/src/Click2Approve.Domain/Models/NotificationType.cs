namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an opt-out notification type.
/// </summary>
public enum NotificationType
{
    ApprovalRequestTaskCreated = 0,
    ApprovalRequestCancelled = 2,
    ApprovalRequestReviewed = 4
}
