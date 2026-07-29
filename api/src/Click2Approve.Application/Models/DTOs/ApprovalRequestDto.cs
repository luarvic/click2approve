namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approval request returned to its author.
/// </summary>
public class ApprovalRequestDto : ApprovalRequestListItemDto
{
    public required List<ApprovalRequestFileDto> RequestFiles { get; init; }
    public required List<ApprovalRequestStepDto> Steps { get; init; }
    public string? Description { get; init; }
    public required string CreatedByUserId { get; init; }
    public required string CreatedByEmail { get; init; }
    public Guid? PreviousRevisionApprovalRequestGlobalId { get; init; }
    public string? PreviousRevisionApprovalRequestTitle { get; init; }
    public Guid? NextRevisionApprovalRequestGlobalId { get; init; }
    public string? NextRevisionApprovalRequestTitle { get; init; }
    public required List<ApprovalRequestLogEntryDto> LogEntries { get; init; }
    public required List<ApprovalRequestTaskLogEntryDto> TaskLogEntries { get; init; }
}
