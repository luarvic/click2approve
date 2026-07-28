namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents a visibility setting for a request step and configured approver.
/// </summary>
public class ApprovalRequestStepVisibilitySubmitDto
{
    public required int StepSequence { get; set; }
    public required int ApproverStepSequence { get; set; }
    public required int ApproverIndex { get; set; }
    public required bool IsVisible { get; set; }
}
