namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents available approval request task statuses.
/// </summary>
public enum ApprovalRequestTaskStatus
{
    Pending = 0,
    Completed = 1,
    Skipped = 3,
    Canceled = 4
}
