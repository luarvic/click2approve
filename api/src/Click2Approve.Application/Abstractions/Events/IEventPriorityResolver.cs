using Click2Approve.Application.Models.Events;

namespace Click2Approve.Application.Abstractions.Events;

/// <summary>
/// Resolves the configured delivery priority for an event type.
/// </summary>
public interface IEventPriorityResolver
{
    EventPriority Resolve(string eventType);
}
