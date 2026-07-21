namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents available approval request statuses.
/// </summary>
public enum ApprovalRequestStatus
{
    Draft = 0,
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Canceled = 4,
    Started = 5
}
