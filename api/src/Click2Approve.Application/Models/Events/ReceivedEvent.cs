namespace Click2Approve.Application.Models.Events;

/// <summary>
/// Represents an event leased from the queue for processing.
/// </summary>
public sealed record ReceivedEvent(
    EventEnvelope Envelope,
    EventPriority Priority,
    string MessageId,
    string PopReceipt,
    int DequeueCount);
