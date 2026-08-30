using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Domain.Models;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides persistence operations for unpublished event messages.
/// </summary>
public class EventOutboxRepository(ApiDbContext db) : IEventOutboxRepository
{
    private readonly ApiDbContext _db = db;

    public async Task AddAsync(EventOutboxMessage message, CancellationToken cancellationToken) =>
        await _db.Set<EventOutboxMessage>().AddAsync(message, cancellationToken);
}
