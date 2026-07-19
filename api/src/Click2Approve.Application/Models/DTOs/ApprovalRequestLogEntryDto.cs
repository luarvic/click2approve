using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approval request log entry.
/// </summary>
public class ApprovalRequestLogEntryDto
{
    public long Id { get; init; }
    public DateTime Timestamp { get; init; }
    public ApprovalLogActorType ActorType { get; init; }
    public string? ActorUserId { get; init; }
    public long? ActorEmployeeId { get; init; }
    public required string ActorEmail { get; init; }
    public string? ActorDisplayName { get; init; }
    public ApprovalRequestLogEventType EventType { get; init; }
    public required string Details { get; init; }
}
