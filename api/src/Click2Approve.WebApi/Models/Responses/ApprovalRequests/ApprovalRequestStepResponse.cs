using System.Text.Json.Serialization;
using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents an approval workflow step returned with an approval request.
/// </summary>
public class ApprovalRequestStepResponse
{
    public Guid? GlobalId { get; init; }
    public int Sequence { get; init; }
    public ApprovalStepMode? Mode { get; init; }
    public ApprovalRequestTaskAction Action { get; init; }
    public string? Instructions { get; init; }
    public bool IsAttachmentRequired { get; init; }
    public bool IsCommentRequired { get; init; }
    public bool IsElectronicSignatureRequired { get; init; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ApprovalStepVisibilityMode? VisibilityMode { get; init; }
    public bool IsVisible { get; init; } = true;
    public List<ApprovalRequestAssigneeResponse> Assignees { get; init; } = [];
    public List<ApprovalRequestTaskResponse> Tasks { get; init; } = [];
}
