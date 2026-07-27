namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents how an approval request file changed from the previous revision.
/// </summary>
public enum ApprovalRequestFileRevisionAction
{
    Unchanged = 0,
    Added = 1,
    Removed = 2,
    Replaced = 3
}
