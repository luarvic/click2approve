namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents available approval request task statuses.
/// </summary>
public enum ApprovalRequestTaskStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Skipped = 3
}
