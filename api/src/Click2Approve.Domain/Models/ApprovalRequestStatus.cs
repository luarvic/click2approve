namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents available approval request statuses.
/// </summary>
public enum ApprovalRequestStatus
{
    Draft = 0,
    Pending = 1,
    Completed = 2,
    Canceled = 4,
    Started = 5,
    Superseded = 6
}
