namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approval request returned to its author.
/// </summary>
public class ApprovalRequestDto : ApprovalRequestListItemDto
{
    public required List<UserFileDto> UserFiles { get; init; }
    public required List<ApprovalRequestStepDto> Steps { get; init; }
    public string? Description { get; init; }
    public required string CreatedByUserId { get; init; }
    public required string CreatedByEmail { get; init; }
    public required List<ApprovalRequestTaskDto> Tasks { get; init; }
}
