namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an approval request log entry.
/// </summary>
public class ApprovalRequestLogEntry : DbEntity
{
    public required long ApprovalRequestId { get; set; }
    public ApprovalRequest ApprovalRequest { get; set; } = null!;
    public required DateTime Timestamp { get; set; }
    public required ApprovalLogActorType ActorType { get; set; }
    public string? ActorUserId { get; set; }
    public AppUser? ActorUser { get; set; }
    public long? ActorEmployeeId { get; set; }
    public required string ActorEmail { get; set; }
    public string? ActorDisplayName { get; set; }
    public required ApprovalRequestLogEventType EventType { get; set; }
    public required string Details { get; set; }
    public long TenantId { get; set; }
    public Tenant? Tenant { get; set; }
}
