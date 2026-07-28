namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents a data transfer object required to resubmit an approval request.
/// </summary>
public class ApprovalRequestResubmitDto
{
    public List<ApprovalRequestFileSubmitDto> RequestFiles { get; set; } = [];
    public List<ApprovalRequestStepSubmitDto> Steps { get; set; } = [];
    public string? Description { get; set; }
}
