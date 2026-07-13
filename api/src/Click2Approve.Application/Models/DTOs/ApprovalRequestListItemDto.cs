using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approval request displayed in an outbox list.
/// </summary>
public class ApprovalRequestListItemDto
{
    public long Id { get; init; }
    public required string Title { get; init; }
    public ApprovalRequestStatus Status { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
}
