using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Exceptions;

namespace Click2Approve.Infrastructure.Events;

/// <summary>
/// Resolves event priorities from application configuration.
/// </summary>
public sealed class ConfigurationEventPriorityResolver(IConfiguration configuration) : IEventPriorityResolver
{
    public EventPriority Resolve(string eventType)
    {
        var configuredPriority = configuration.GetSection("EventQueue:Priorities")
            .GetChildren()
            .SingleOrDefault(section => section.Get<string[]>()?.Contains(eventType, StringComparer.Ordinal) == true)
            ?.Key;
        return Enum.TryParse<EventPriority>(configuredPriority, ignoreCase: true, out var priority)
            ? priority
            : throw new InfrastructureException($"No event priority is configured for '{eventType}'.");
    }
}
