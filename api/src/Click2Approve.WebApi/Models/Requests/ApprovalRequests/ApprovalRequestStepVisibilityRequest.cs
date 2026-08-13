namespace Click2Approve.WebApi.Models.Requests.ApprovalRequests;

/// <summary>
/// Represents a visibility setting for a request step and configured assignee.
/// </summary>
public class ApprovalRequestStepVisibilityRequest
{
    public required int StepSequence { get; set; }
    public required int AssigneeStepSequence { get; set; }
    public required int AssigneeIndex { get; set; }
    public required bool IsVisible { get; set; }
}
