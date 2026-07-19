using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approval request task log entry.
/// </summary>
public class ApprovalRequestTaskLogEntryDto
{
    public long Id { get; init; }
    public long ApprovalRequestTaskId { get; init; }
    public DateTime Timestamp { get; init; }
    public ApprovalLogActorType ActorType { get; init; }
    public string? ActorUserId { get; init; }
    public long? ActorEmployeeId { get; init; }
    public required string ActorEmail { get; init; }
    public string? ActorDisplayName { get; init; }
    public ApprovalLogActorType? OnBehalfOfActorType { get; init; }
    public string? OnBehalfOfUserId { get; init; }
    public long? OnBehalfOfEmployeeId { get; init; }
    public string? OnBehalfOfEmail { get; init; }
    public string? OnBehalfOfDisplayName { get; init; }
    public ApprovalRequestTaskLogEventType EventType { get; init; }
    public required string Details { get; init; }
}
