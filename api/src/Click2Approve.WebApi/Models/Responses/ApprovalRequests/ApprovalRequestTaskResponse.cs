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
        AssigneeUserId = source.AssigneeUserId;
        AssigneeEmail = source.AssigneeEmail;
        AssigneeDisplayName = source.AssigneeDisplayName;
        CompletedByDisplayName = source.CompletedByDisplayName;
        CompletedByEmail = source.CompletedByEmail;
        RequestedByEmail = source.RequestedByEmail;
        RequestedByDisplayName = source.RequestedByDisplayName;
        OrganizationDisplayName = source.OrganizationDisplayName;
        Description = source.Description;
        Comment = source.Comment;
        AssigneeIpAddress = source.AssigneeIpAddress;
        AssigneeBrowserData = source.AssigneeBrowserData;
        AssigneeLegalName = source.AssigneeLegalName;
        AssigneeOrganization = source.AssigneeOrganization;
        IsAssigneeEmployee = source.IsAssigneeEmployee;
        HasAssigneeSignature = source.HasAssigneeSignature;
        AssigneeSignatureJson = source.AssigneeSignatureJson;
        TaskFiles = source.TaskFiles;
    }

    public Guid ApprovalRequestGlobalId { get; init; }
    public Guid ApprovalRequestStepGlobalId { get; init; }
    public Guid? ApprovalRequestStepAssigneeGlobalId { get; init; }
    public required string AssigneeUserId { get; init; }
    public required string AssigneeEmail { get; init; }
    public required string AssigneeDisplayName { get; init; }
    public string? CompletedByDisplayName { get; init; }
    public string? CompletedByEmail { get; init; }
    public string? Description { get; init; }
    public string? Comment { get; init; }
    public string? AssigneeIpAddress { get; init; }
    public string? AssigneeBrowserData { get; init; }
    public string? AssigneeLegalName { get; init; }
    public string? AssigneeOrganization { get; init; }
    public bool HasAssigneeSignature { get; init; }
    public bool IsAssigneeEmployee { get; init; }
    public string? AssigneeSignatureJson { get; init; }
    public List<UserFileResponse> TaskFiles { get; init; } = [];
}
