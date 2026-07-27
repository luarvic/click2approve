using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents a file submitted with approval request revision metadata.
/// </summary>
public class ApprovalRequestFileSubmitDto
{
    public long UserFileId { get; set; }
    public int Sequence { get; set; }
    public ApprovalRequestFileRevisionAction RevisionAction { get; set; }
    public long? PreviousApprovalRequestFileId { get; set; }
}
