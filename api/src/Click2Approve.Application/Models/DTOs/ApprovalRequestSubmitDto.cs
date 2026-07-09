namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents a data transfer object required to submit an approval request.
/// </summary>
public class ApprovalRequestSubmitDto
{
    public required string Title { get; set; }
    public required List<long> UserFileIds { get; set; }
    public List<ApprovalRequestStepSubmitDto> Steps { get; set; } = [];
    public DateTime? ApproveBy { get; set; }
    public string? Comment { get; set; }
    public long? ClonedFromApprovalRequestId { get; set; }
}
