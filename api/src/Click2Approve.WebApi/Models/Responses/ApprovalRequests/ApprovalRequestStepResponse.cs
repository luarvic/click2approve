using System.Text.Json.Serialization;
using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents an approval workflow step returned with an approval request.
/// </summary>
public class ApprovalRequestStepResponse
{
    /// <summary>Global identifier of the approval request step.</summary>
    public Guid? GlobalId { get; init; }
    /// <summary>Position of the item in its ordered list.</summary>
    public int Sequence { get; init; }
    /// <summary>Execution mode of the approval step.</summary>
    public ApprovalStepMode? Mode { get; init; }
    /// <summary>Action assigned to this approval step or task.</summary>
    public ApprovalRequestTaskAction Action { get; init; }
    /// <summary>Instructions shown to the assignee for this step.</summary>
    public string? Instructions { get; init; }
    /// <summary>Whether completing the step requires an attachment.</summary>
    public bool IsAttachmentRequired { get; init; }
    /// <summary>Whether completing the step requires a comment.</summary>
    public bool IsCommentRequired { get; init; }
    /// <summary>Whether completing the step requires an electronic signature.</summary>
    public bool IsElectronicSignatureRequired { get; init; }
    /// <summary>Visibility rule for the approval step.</summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ApprovalStepVisibilityMode? VisibilityMode { get; init; }
    /// <summary>Whether this step is visible to the current user.</summary>
    public bool IsVisible { get; init; } = true;
    /// <summary>Assignees for this approval step.</summary>
    public List<ApprovalRequestAssigneeResponse> Assignees { get; init; } = [];
    /// <summary>Tasks created for this approval step.</summary>
    public List<ApprovalRequestTaskResponse> Tasks { get; init; } = [];
}
