namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents the action requested from an approval request task assignee.
/// </summary>
public enum ApprovalRequestTaskAction
{
    Approve = 0,
    Sign = 1,
    Confirm = 2,
    Acknowledge = 3,
    Review = 4,
    Verify = 5,
    Accept = 6,
    Complete = 7
}
