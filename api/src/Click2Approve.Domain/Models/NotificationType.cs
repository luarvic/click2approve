namespace Click2Approve.Domain.Models;

/// <summary>
/// Identifies the business purpose of a notification.
/// </summary>
public enum NotificationType
{
    // Sent to the task recipient.
    ApprovalRequestTaskCreated = 0,

    // Sent to the task recipient when completed by the system.
    ApprovalRequestTaskCompleted = 1,

    // Sent to the requester.
    ApprovalRequestStepCompleted = 2,

    // Sent to the requester.
    ApprovalRequestCompleted = 3,

    // Sent to chat participants.
    DiscussionMessageCreated = 4
}
