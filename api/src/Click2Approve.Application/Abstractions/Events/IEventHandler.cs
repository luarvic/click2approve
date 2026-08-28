using Click2Approve.Application.Models.Events;

namespace Click2Approve.Application.Abstractions.Events;

/// <summary>
/// Handles one versioned application event type.
/// </summary>
public interface IEventHandler
{
    string EventType { get; }
    Task HandleAsync(EventEnvelope envelope, CancellationToken cancellationToken);
}
