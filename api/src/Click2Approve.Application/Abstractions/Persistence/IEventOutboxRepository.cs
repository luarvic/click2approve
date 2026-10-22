using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Persistence;

/// <summary>
/// Defines persistence operations for unpublished event messages.
/// </summary>
public interface IEventOutboxRepository
{
    Task AddAsync(EventOutboxMessage message, CancellationToken cancellationToken);
}
