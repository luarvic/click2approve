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
        Id = source.Id;
        Title = source.Title;
        Status = source.Status;
        CreatedAt = source.CreatedAt;
        ApprovalRequestId = source.ApprovalRequestId;
        ApprovalRequestStepId = source.ApprovalRequestStepId;
        ApprovalRequestStepApproverId = source.ApprovalRequestStepApproverId;
        ApproverUserId = source.ApproverUserId;
        ApproverEmail = source.ApproverEmail;
        ApproverDisplayName = source.ApproverDisplayName;
        CanViewRequest = source.CanViewRequest;
        Description = source.Description;
        Comment = source.Comment;
        LogEntries = source.LogEntries;
    }

    public long ApprovalRequestId { get; init; }
    public long ApprovalRequestStepId { get; init; }
    public long? ApprovalRequestStepApproverId { get; init; }
    public string? ApproverUserId { get; init; }
    public required string ApproverEmail { get; init; }
    public required string ApproverDisplayName { get; init; }
    public bool CanViewRequest { get; init; }
    public string? Description { get; init; }
    public string? Comment { get; init; }
    public required List<ApprovalRequestTaskLogEntryDto> LogEntries { get; init; }
}
