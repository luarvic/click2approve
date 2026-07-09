namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents mutable approval request steps that have not passed yet.
/// </summary>
public class ApprovalRequestStepsUpdateDto
{
    public required List<ApprovalRequestStepUpdateDto> Steps { get; set; }
}
