using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents a file attached to an approval request with revision metadata.
/// </summary>
public class ApprovalRequestFileDto
{
    public long Id { get; init; }
    public required UserFileDto UserFile { get; init; }
    public int Sequence { get; init; }
    public ApprovalRequestFileRevisionAction RevisionAction { get; init; }
    public long? PreviousApprovalRequestFileId { get; init; }
    public UserFileDto? PreviousUserFile { get; init; }
}
