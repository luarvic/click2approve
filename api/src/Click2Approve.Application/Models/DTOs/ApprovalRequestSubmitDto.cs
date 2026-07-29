namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents a data transfer object required to submit an approval request.
/// </summary>
public class ApprovalRequestSubmitDto
{
    public required string Title { get; set; }
    public Guid? PreviousRevisionApprovalRequestGlobalId { get; set; }
    public List<ApprovalRequestFileSubmitDto> RequestFiles { get; set; } = [];
    public List<ApprovalRequestStepSubmitDto> Steps { get; set; } = [];
    public List<ApprovalRequestStepVisibilitySubmitDto> StepVisibility { get; set; } = [];
    public string? Description { get; set; }
}
