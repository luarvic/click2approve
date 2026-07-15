namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an opt-out notification type.
/// </summary>
public enum NotificationType
{
    ApprovalRequestTaskCreated = 0,
    ApprovalRequestTaskRemoved = 1,
    ApprovalRequestCancelled = 2,
    ApprovalRequestDeleted = 3,
    ApprovalRequestReviewed = 4
}
