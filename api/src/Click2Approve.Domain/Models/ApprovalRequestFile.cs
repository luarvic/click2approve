namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a file attached to an approval request with revision metadata.
/// </summary>
public class ApprovalRequestFile : DbEntity
{
    // Foreign key identifiers
    public long ApprovalRequestId { get; set; }
    public long? PreviousApprovalRequestFileId { get; set; }
    public long UserFileId { get; set; }

    // Scalar properties
    public ApprovalRequestFileRevisionAction RevisionAction { get; set; }
    public int Sequence { get; set; }

    // Navigation properties
    public ApprovalRequest ApprovalRequest { get; set; } = null!;
    public ApprovalRequestFile? PreviousApprovalRequestFile { get; set; }
    public UserFile UserFile { get; set; } = null!;
}
