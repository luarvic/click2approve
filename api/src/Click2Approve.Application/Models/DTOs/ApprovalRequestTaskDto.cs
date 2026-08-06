using System.Diagnostics.CodeAnalysis;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approval task returned with an approval request.
/// </summary>
public class ApprovalRequestTaskDto : ApprovalRequestTaskListItemDto
{
    public ApprovalRequestTaskDto()
    {
    }

    [SetsRequiredMembers]
    protected ApprovalRequestTaskDto(ApprovalRequestTaskDto source)
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
        ApprovalRequestStepApproverGlobalId = source.ApprovalRequestStepApproverGlobalId;
        ApproverUserId = source.ApproverUserId;
        ApproverEmail = source.ApproverEmail;
        ApproverDisplayName = source.ApproverDisplayName;
        CompletedByDelegateEmployeeDisplayName = source.CompletedByDelegateEmployeeDisplayName;
        CompletedByDelegateEmployeeEmail = source.CompletedByDelegateEmployeeEmail;
        RequestedByEmail = source.RequestedByEmail;
        RequestedByDisplayName = source.RequestedByDisplayName;
        OrganizationDisplayName = source.OrganizationDisplayName;
        Description = source.Description;
        Comment = source.Comment;
        ApproverIpAddress = source.ApproverIpAddress;
        ApproverBrowserData = source.ApproverBrowserData;
        ApproverLegalName = source.ApproverLegalName;
        HasApproverSignature = source.HasApproverSignature;
        ApproverSignatureJson = source.ApproverSignatureJson;
    }

    public Guid ApprovalRequestGlobalId { get; init; }
    public Guid ApprovalRequestStepGlobalId { get; init; }
    public Guid? ApprovalRequestStepApproverGlobalId { get; init; }
    public string? ApproverUserId { get; init; }
    public required string ApproverEmail { get; init; }
    public required string ApproverDisplayName { get; init; }
    public string? CompletedByDelegateEmployeeDisplayName { get; init; }
    public string? CompletedByDelegateEmployeeEmail { get; init; }
    public string? Description { get; init; }
    public string? Comment { get; init; }
    public string? ApproverIpAddress { get; init; }
    public string? ApproverBrowserData { get; init; }
    public string? ApproverLegalName { get; init; }
    public bool HasApproverSignature { get; init; }
    public string? ApproverSignatureJson { get; init; }
}
