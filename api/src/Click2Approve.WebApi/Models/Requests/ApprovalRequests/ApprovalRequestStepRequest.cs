namespace Click2Approve.WebApi.Models.Requests.ApprovalRequests;

using Click2Approve.Domain.Models;

/// <summary>
/// Represents a data transfer object required to submit an approval request step.
/// </summary>
public class ApprovalRequestStepRequest
{
    /// <summary>Position of the item in its ordered list.</summary>
    public required int Sequence { get; set; }
    /// <summary>Execution mode of the approval step.</summary>
    public required ApprovalStepMode Mode { get; set; }
    /// <summary>Action assigned to this approval step or task.</summary>
    public required ApprovalRequestTaskAction Action { get; set; }
    /// <summary>Instructions shown to the assignee for this step.</summary>
    public string? Instructions { get; set; }
    /// <summary>Whether completing the step requires an attachment.</summary>
    public bool IsAttachmentRequired { get; set; }
    /// <summary>Whether completing the step requires a comment.</summary>
    public bool IsCommentRequired { get; set; }
    /// <summary>Whether completing the step requires an electronic signature.</summary>
    public bool IsElectronicSignatureRequired { get; set; }
    /// <summary>Visibility rule for the approval step.</summary>
    public ApprovalStepVisibilityMode VisibilityMode { get; set; } = ApprovalStepVisibilityMode.AllParticipants;
    /// <summary>Assignees for this approval step.</summary>
    public required List<ApprovalRequestAssigneeRequest> Assignees { get; set; }
}
