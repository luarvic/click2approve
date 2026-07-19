namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approval request task log entry.
/// </summary>
public class ApprovalRequestTaskLogEntry : DbEntity
{
    public required long ApprovalRequestTaskId { get; set; }
    public ApprovalRequestTask ApprovalRequestTask { get; set; } = null!;
    public required DateTime Timestamp { get; set; }
    public required ApprovalLogActorType ActorType { get; set; }
    public string? ActorUserId { get; set; }
    public AppUser? ActorUser { get; set; }
    public long? ActorEmployeeId { get; set; }
    public required string ActorEmail { get; set; }
    public string? ActorDisplayName { get; set; }
    public ApprovalLogActorType? OnBehalfOfActorType { get; set; }
    public string? OnBehalfOfUserId { get; set; }
    public long? OnBehalfOfEmployeeId { get; set; }
    public string? OnBehalfOfEmail { get; set; }
    public string? OnBehalfOfDisplayName { get; set; }
    public required ApprovalRequestTaskLogEventType EventType { get; set; }
    public required string Details { get; set; }
    public long TenantId { get; set; }
    public Tenant? Tenant { get; set; }
}
