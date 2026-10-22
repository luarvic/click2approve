namespace Click2Approve.Application.Models.Commands.ApprovalRequests;

using Click2Approve.Domain.Models;

/// <summary>
/// Represents a data transfer object required to submit an approval request step.
/// </summary>
public class ApprovalRequestStepCommand
{
    public required int Sequence { get; set; }
    public required ApprovalStepMode Mode { get; set; }
    public required ApprovalRequestTaskAction Action { get; set; }
    public string? Instructions { get; set; }
    public bool IsAttachmentRequired { get; set; }
    public bool IsCommentRequired { get; set; }
    public bool IsElectronicSignatureRequired { get; set; }
    public ApprovalStepVisibilityMode VisibilityMode { get; set; } = ApprovalStepVisibilityMode.AllParticipants;
    public required List<ApprovalRequestAssigneeCommand> Assignees { get; set; }
}
