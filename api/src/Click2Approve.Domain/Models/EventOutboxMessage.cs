namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents an event awaiting reliable publication to the queue.
/// </summary>
public class EventOutboxMessage : DbEntity
{
    // Scalar properties
    public required Guid EventId { get; set; }
    public required string EventType { get; set; }
    public required DateTime OccurredAt { get; set; }
    public required string Payload { get; set; }
    public DateTime? PublishedAt { get; set; }
}
