using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for domain event deliveries.
/// </summary>
public class EventDeliveryRepository(ApiDbContext db) : IEventDeliveryRepository
{
    private readonly ApiDbContext _db = db;

    public async Task<DomainEvent> AddEventAsync(DomainEvent domainEvent, CancellationToken cancellationToken) =>
        (await _db.DomainEvents.AddAsync(domainEvent, cancellationToken)).Entity;

    public async Task AddDeliveryAsync(EventDelivery delivery, CancellationToken cancellationToken) =>
        await _db.EventDeliveries.AddAsync(delivery, cancellationToken);

    public Task<long> CountUnreadAsync(
        string userId,
        long tenantId,
        EventDeliveryChannel channel,
        CancellationToken cancellationToken) =>
        _db.EventDeliveries.LongCountAsync(
            delivery => delivery.UserId == userId &&
                        delivery.TenantId == tenantId &&
                        delivery.Channel == channel &&
                        delivery.ReadAt == null,
            cancellationToken);

    public Task<List<EventDelivery>> ListAsync(
        string userId,
        long tenantId,
        EventDeliveryChannel channel,
        bool unreadOnly,
        int skip,
        int take,
        CancellationToken cancellationToken)
    {
        var deliveries = _db.EventDeliveries.AsNoTracking()
            .Include(delivery => delivery.DomainEvent)
            .Where(delivery => delivery.UserId == userId &&
                               delivery.TenantId == tenantId &&
                               delivery.Channel == channel);
        if (unreadOnly) deliveries = deliveries.Where(delivery => delivery.ReadAt == null);
        return deliveries
            .OrderByDescending(delivery => delivery.DomainEvent.OccurredAt)
            .ThenByDescending(delivery => delivery.Id)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public Task<EventDelivery?> GetForReadAsync(
        string userId,
        long tenantId,
        Guid globalId,
        EventDeliveryChannel channel,
        CancellationToken cancellationToken) =>
        _db.EventDeliveries
            .Include(delivery => delivery.DomainEvent)
            .FirstOrDefaultAsync(
                delivery => delivery.GlobalId == globalId &&
                            delivery.UserId == userId &&
                            delivery.TenantId == tenantId &&
                            delivery.Channel == channel,
                cancellationToken);

    public Task<List<EventDelivery>> ListUnreadForReadAsync(
        string userId,
        long tenantId,
        EventDeliveryChannel channel,
        CancellationToken cancellationToken) =>
        _db.EventDeliveries
            .Where(
                delivery => delivery.UserId == userId &&
                            delivery.TenantId == tenantId &&
                            delivery.Channel == channel &&
                            delivery.ReadAt == null)
            .ToListAsync(cancellationToken);
}
