using Click2Approve.Application.Models.Events;

namespace Click2Approve.Application.Abstractions.Events;

/// <summary>
/// Publishes application events to the durable event transport.
/// </summary>
public interface IEventQueue
{
    Task EnqueueAsync(EventPriority priority, EventEnvelope envelope, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<ReceivedEvent>> ReceiveAsync(
        EventPriority priority,
        int maximumCount,
        TimeSpan visibilityTimeout,
        CancellationToken cancellationToken);
    Task CompleteAsync(ReceivedEvent receivedEvent, CancellationToken cancellationToken);
    Task RetryAsync(ReceivedEvent receivedEvent, TimeSpan delay, CancellationToken cancellationToken);
    Task MoveToPoisonAsync(ReceivedEvent receivedEvent, string error, CancellationToken cancellationToken);
}
