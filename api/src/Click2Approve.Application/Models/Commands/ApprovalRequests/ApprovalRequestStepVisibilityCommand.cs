namespace Click2Approve.Application.Models.Commands.ApprovalRequests;

/// <summary>
/// Represents a visibility setting for a request step and configured assignee.
/// </summary>
public class ApprovalRequestStepVisibilityCommand
{
    public required int StepSequence { get; set; }
    public required int AssigneeStepSequence { get; set; }
    public required int AssigneeIndex { get; set; }
    public required bool IsVisible { get; set; }
}
