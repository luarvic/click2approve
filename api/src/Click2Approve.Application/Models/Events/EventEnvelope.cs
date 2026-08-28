namespace Click2Approve.Application.Models.Events;

/// <summary>
/// Defines the versioned, transport-safe representation of an application event.
/// </summary>
public sealed record EventEnvelope(
    Guid EventId,
    string EventType,
    int Version,
    DateTime OccurredAt,
    string Payload);
