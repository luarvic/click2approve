using System.Diagnostics.CodeAnalysis;

namespace Click2Approve.WebApi.Models.Responses.ApprovalRequests;

/// <summary>
/// Represents an approval task returned with an approval request.
/// </summary>
public class ApprovalRequestTaskResponse : ApprovalRequestTaskListItemResponse
{
    public ApprovalRequestTaskResponse()
    {
    }

    [SetsRequiredMembers]
    protected ApprovalRequestTaskResponse(ApprovalRequestTaskResponse source)
    {
        GlobalId = source.GlobalId;
        Title = source.Title;
        Action = source.Action;
        Status = source.Status;
        Result = source.Result;
        CreatedAt = source.CreatedAt;
        CompletedAt = source.CompletedAt;
        RevisionNumber = source.RevisionNumber;
        ApprovalRequestGlobalId = source.ApprovalRequestGlobalId;
        ApprovalRequestStepGlobalId = source.ApprovalRequestStepGlobalId;
        ApprovalRequestStepAssigneeGlobalId = source.ApprovalRequestStepAssigneeGlobalId;
        AssigneeEmail = source.AssigneeEmail;
        AssigneeDisplayName = source.AssigneeDisplayName;
        CompletedByDisplayName = source.CompletedByDisplayName;
        CompletedByEmail = source.CompletedByEmail;
        RequestedByEmail = source.RequestedByEmail;
        RequestedByDisplayName = source.RequestedByDisplayName;
        OrganizationDisplayName = source.OrganizationDisplayName;
        Description = source.Description;
        Instructions = source.Instructions;
        IsAttachmentRequired = source.IsAttachmentRequired;
        IsCommentRequired = source.IsCommentRequired;
        IsElectronicSignatureRequired = source.IsElectronicSignatureRequired;
        Comment = source.Comment;
        AssigneeIpAddress = source.AssigneeIpAddress;
        AssigneeBrowserData = source.AssigneeBrowserData;
        AssigneeLegalName = source.AssigneeLegalName;
        AssigneeRepresentationDetails = source.AssigneeRepresentationDetails;
        IsAssigneeEmployee = source.IsAssigneeEmployee;
        HasAssigneeSignature = source.HasAssigneeSignature;
        AssigneeSignatureJson = source.AssigneeSignatureJson;
        TaskFiles = source.TaskFiles;
    }

    /// <summary>Global identifier of the approval request.</summary>
    public Guid ApprovalRequestGlobalId { get; init; }
    /// <summary>Global identifier of the approval request step.</summary>
    public Guid ApprovalRequestStepGlobalId { get; init; }
    /// <summary>Global identifier of the step assignee, when assigned.</summary>
    public Guid? ApprovalRequestStepAssigneeGlobalId { get; init; }
    /// <summary>Email address of the assignee.</summary>
    public required string AssigneeEmail { get; init; }
    /// <summary>Display name of the assignee.</summary>
    public required string AssigneeDisplayName { get; init; }
    /// <summary>Display name of the person who completed the approval task.</summary>
    public string? CompletedByDisplayName { get; init; }
    /// <summary>Email address of the person who completed the approval task.</summary>
    public string? CompletedByEmail { get; init; }
    /// <summary>Time when the approval task was completed, if applicable.</summary>
    public DateTime? CompletedAt { get; init; }
    /// <summary>Email address of the person who requested the approval.</summary>
    public required string RequestedByEmail { get; init; }
    /// <summary>Description of the associated approval request.</summary>
    public string? Description { get; init; }
    /// <summary>Instructions shown to the assignee for this step.</summary>
    public string? Instructions { get; init; }
    /// <summary>Whether completing the step requires an attachment.</summary>
    public bool IsAttachmentRequired { get; init; }
    /// <summary>Whether completing the step requires a comment.</summary>
    public bool IsCommentRequired { get; init; }
    /// <summary>Whether completing the step requires an electronic signature.</summary>
    public bool IsElectronicSignatureRequired { get; init; }
    /// <summary>Comment supplied for the task action.</summary>
    public string? Comment { get; init; }
    /// <summary>IP address recorded for the assignee action.</summary>
    public string? AssigneeIpAddress { get; init; }
    /// <summary>Browser data recorded for the assignee action.</summary>
    public string? AssigneeBrowserData { get; init; }
    /// <summary>Legal name supplied by the assignee.</summary>
    public string? AssigneeLegalName { get; init; }
    /// <summary>Details of whom the assignee represents.</summary>
    public string? AssigneeRepresentationDetails { get; init; }
    /// <summary>Whether the assignee provided an electronic signature.</summary>
    public bool HasAssigneeSignature { get; init; }
    /// <summary>Whether the assignee is an employee.</summary>
    public bool IsAssigneeEmployee { get; init; }
    /// <summary>Electronic signature data supplied by the assignee.</summary>
    public string? AssigneeSignatureJson { get; init; }
    /// <summary>Files attached to this task.</summary>
    public List<UserFileResponse> TaskFiles { get; init; } = [];
}
