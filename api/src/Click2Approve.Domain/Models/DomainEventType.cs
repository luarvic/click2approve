namespace Click2Approve.Domain.Models;

/// <summary>
/// Identifies a business fact that can be consumed by one or more clients.
/// </summary>
public enum DomainEventType
{
    ApprovalRequestTaskCreated = 0,
    ApprovalRequestCancelled = 1,
    ApprovalRequestReviewed = 2,
    DiscussionRequestMessageCreated = 3,
    DiscussionTaskMessageCreated = 4
}
