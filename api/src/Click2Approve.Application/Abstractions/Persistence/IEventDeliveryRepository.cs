using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Persistence;

/// <summary>
/// Defines persistence operations for domain events and their deliveries.
/// </summary>
public interface IEventDeliveryRepository
{
    Task<DomainEvent> AddEventAsync(DomainEvent domainEvent, CancellationToken cancellationToken);
    Task AddDeliveryAsync(EventDelivery delivery, CancellationToken cancellationToken);
    Task<long> CountUnreadAsync(
        string userId,
        long tenantId,
        EventDeliveryChannel channel,
        CancellationToken cancellationToken);
    Task<List<EventDelivery>> ListAsync(
        string userId,
        long tenantId,
        EventDeliveryChannel channel,
        bool unreadOnly,
        int skip,
        int take,
        CancellationToken cancellationToken);
    Task<EventDelivery?> GetForReadAsync(
        string userId,
        long tenantId,
        Guid globalId,
        EventDeliveryChannel channel,
        CancellationToken cancellationToken);
    Task<List<EventDelivery>> ListUnreadForReadAsync(
        string userId,
        long tenantId,
        EventDeliveryChannel channel,
        CancellationToken cancellationToken);
}
