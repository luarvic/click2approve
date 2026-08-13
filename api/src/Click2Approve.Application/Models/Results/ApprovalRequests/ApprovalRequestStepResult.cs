using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Results.ApprovalRequests;

/// <summary>
/// Represents an approval workflow step returned with an approval request.
/// </summary>
public class ApprovalRequestStepResult
{
    public Guid? GlobalId { get; init; }
    public int Sequence { get; init; }
    public ApprovalStepMode? Mode { get; init; }
    public ApprovalRequestTaskAction Action { get; init; }
    public ApprovalStepVisibilityMode? VisibilityMode { get; init; }
    public bool IsVisible { get; init; } = true;
    public List<ApprovalRequestAssigneeResult> Assignees { get; init; } = [];
    public List<ApprovalRequestTaskResult> Tasks { get; init; } = [];
    public List<ApprovalRequestStepVisibilityResult> Visibility { get; init; } = [];
}
