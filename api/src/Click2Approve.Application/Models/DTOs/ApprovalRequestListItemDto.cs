using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approval request displayed in an outbox list.
/// </summary>
public class ApprovalRequestListItemDto
{
    public Guid GlobalId { get; init; }
    public required string Title { get; init; }
    public ApprovalRequestStatus Status { get; init; }
    public bool? Result { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public required string CreatedByEmail { get; init; }
    public required string CreatedByDisplayName { get; init; }
    public required string OrganizationDisplayName { get; init; }
    public int RevisionNumber { get; init; }
}
