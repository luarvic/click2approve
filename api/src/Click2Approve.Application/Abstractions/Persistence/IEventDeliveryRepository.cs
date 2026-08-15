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
        long userId,
        long tenantId,
        EventDeliveryChannel channel,
        CancellationToken cancellationToken);
    Task<List<EventDelivery>> ListAsync(
        long userId,
        long tenantId,
        EventDeliveryChannel channel,
        bool unreadOnly,
        int skip,
        int take,
        CancellationToken cancellationToken);
    Task<EventDelivery?> GetForReadAsync(
        long userId,
        long tenantId,
        Guid globalId,
        EventDeliveryChannel channel,
        CancellationToken cancellationToken);
    Task<List<EventDelivery>> ListForReadAsync(
        long userId,
        long tenantId,
        IReadOnlyCollection<Guid> globalIds,
        EventDeliveryChannel channel,
        CancellationToken cancellationToken);
    Task<List<EventDelivery>> ListUnreadForReadAsync(
        long userId,
        long tenantId,
        EventDeliveryChannel channel,
        CancellationToken cancellationToken);
    void RemoveRange(IReadOnlyCollection<EventDelivery> deliveries);
}
