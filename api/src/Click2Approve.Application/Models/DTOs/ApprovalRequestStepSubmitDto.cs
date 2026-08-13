namespace Click2Approve.Application.Models.DTOs;

using Click2Approve.Domain.Models;

/// <summary>
/// Represents a data transfer object required to submit an approval request step.
/// </summary>
public class ApprovalRequestStepSubmitDto
{
    public required int Sequence { get; set; }
    public required ApprovalStepMode Mode { get; set; }
    public required ApprovalRequestTaskAction Action { get; set; }
    public ApprovalStepVisibilityMode VisibilityMode { get; set; } = ApprovalStepVisibilityMode.AllParticipants;
    public required List<ApprovalRequestAssigneeSubmitDto> Assignees { get; set; }
}
