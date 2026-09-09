namespace Click2Approve.Domain.Models;

/// <summary>
/// Identifies the business purpose of a notification.
/// </summary>
public enum NotificationType
{
    // Sent to the task assignees.
    ApprovalRequestTaskCreated = 0,

    // Sent to the task assignees when completed by the system.
    ApprovalRequestTaskCompleted = 1,

    // Sent to the requester.
    ApprovalRequestStepCompleted = 2,

    // Sent to the requester and assignees of the request tasks.
    ApprovalRequestCompleted = 3,

    // Sent to chat participants.
    DiscussionMessageCreated = 4,

    // Sent to tenant owners and administrators during payment recovery.
    BillingRecovery = 5
}
