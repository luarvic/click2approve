using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approval request returned to its author.
/// </summary>
public class ApprovalRequestDto
{
    public long Id { get; init; }
    public required string Title { get; init; }
    public required List<UserFileDto> UserFiles { get; init; }
    public required List<ApprovalRequestStepDto> Steps { get; init; }
    public string? Description { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public required string AuthorUserId { get; init; }
    public required string AuthorEmail { get; init; }
    public ApprovalRequestStatus Status { get; init; }
    public required List<ApprovalRequestTaskDto> Tasks { get; init; }
}
