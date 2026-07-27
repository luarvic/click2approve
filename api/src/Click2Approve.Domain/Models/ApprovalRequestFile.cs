namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a file attached to an approval request with revision metadata.
/// </summary>
public class ApprovalRequestFile : DbEntity
{
    public long ApprovalRequestId { get; set; }
    public ApprovalRequest ApprovalRequest { get; set; } = null!;
    public long UserFileId { get; set; }
    public UserFile UserFile { get; set; } = null!;
    public int Sequence { get; set; }
    public ApprovalRequestFileRevisionAction RevisionAction { get; set; }
    public long? PreviousApprovalRequestFileId { get; set; }
    public ApprovalRequestFile? PreviousApprovalRequestFile { get; set; }
}
