using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approval request task displayed in an inbox list.
/// </summary>
public class ApprovalRequestTaskListItemDto
{
    public long Id { get; init; }
    public required string Title { get; init; }
    public ApprovalRequestTaskStatus Status { get; init; }
    public DateTime CreatedAt { get; init; }
    public required string RequestedByDisplayName { get; init; }
}
