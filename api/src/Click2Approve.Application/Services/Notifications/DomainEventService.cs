using Click2Approve.Application.Models.Notifications;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.Notifications;

/// <summary>
/// Implements durable domain event and in-app delivery operations.
/// </summary>
public class DomainEventService(IEventDeliveryRepository eventDeliveryRepository, IUnitOfWork unitOfWork) : IDomainEventService
{
    private readonly IEventDeliveryRepository _eventDeliveryRepository = eventDeliveryRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task CreateEventsAsync(IReadOnlyCollection<DomainEventCreate> events, CancellationToken cancellationToken)
    {
        foreach (var domainEvent in events)
        {
            var persistedEvent = await _eventDeliveryRepository.AddEventAsync(new DomainEvent
            {
                Type = domainEvent.Type,
                TenantId = domainEvent.TenantId,
                EntityGlobalId = domainEvent.EntityGlobalId,
                OccurredAt = DateTime.UtcNow,
                Summary = domainEvent.Summary
            }, cancellationToken);

            foreach (var recipient in domainEvent.Recipients.Distinct())
            {
                await _eventDeliveryRepository.AddDeliveryAsync(new EventDelivery
                {
                    DomainEvent = persistedEvent,
                    DomainEventId = persistedEvent.Id,
                    UserId = recipient.UserId,
                    TenantId = domainEvent.TenantId,
                    Channel = recipient.Channel,
                    QueuedAt = recipient.Channel == EventDeliveryChannel.Email ? DateTime.UtcNow : null
                }, cancellationToken);
            }
        }
    }

    public Task<long> CountInAppUnreadAsync(
        AppUser user,
        long tenantId,
        CancellationToken cancellationToken) =>
        _eventDeliveryRepository.CountUnreadAsync(
            user.Id,
            tenantId,
            EventDeliveryChannel.InApp,
            cancellationToken);

    public async Task<List<InAppNotificationResult>> ListInAppAsync(
        AppUser user,
        long tenantId,
        bool unreadOnly,
        int skip,
        int take,
        CancellationToken cancellationToken)
    {
        var deliveries = await _eventDeliveryRepository.ListAsync(
            user.Id,
            tenantId,
            EventDeliveryChannel.InApp,
            unreadOnly,
            skip,
            take,
            cancellationToken);
        return [.. deliveries.Select(Map)];
    }

    public async Task MarkInAppReadAsync(
        AppUser user,
        long tenantId,
        Guid deliveryGlobalId,
        CancellationToken cancellationToken)
    {
        var delivery =
            await _eventDeliveryRepository.GetForReadAsync(
                user.Id,
                tenantId,
                deliveryGlobalId,
                EventDeliveryChannel.InApp,
                cancellationToken)
            ?? throw new NotFoundException("Notification was not found.");
        delivery.ReadAt ??= DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkAllInAppReadAsync(
        AppUser user,
        long tenantId,
        CancellationToken cancellationToken)
    {
        var deliveries = await _eventDeliveryRepository.ListUnreadForReadAsync(
            user.Id,
            tenantId,
            EventDeliveryChannel.InApp,
            cancellationToken);
        foreach (var delivery in deliveries) delivery.ReadAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkInAppReadAsync(
        AppUser user,
        long tenantId,
        IReadOnlyCollection<Guid> deliveryGlobalIds,
        CancellationToken cancellationToken)
    {
        var deliveries = await _eventDeliveryRepository.ListForReadAsync(
            user.Id,
            tenantId,
            deliveryGlobalIds.Distinct().ToArray(),
            EventDeliveryChannel.InApp,
            cancellationToken);
        foreach (var delivery in deliveries) delivery.ReadAt ??= DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteInAppAsync(
        AppUser user,
        long tenantId,
        IReadOnlyCollection<Guid> deliveryGlobalIds,
        CancellationToken cancellationToken)
    {
        var deliveries = await _eventDeliveryRepository.ListForReadAsync(
            user.Id,
            tenantId,
            deliveryGlobalIds.Distinct().ToArray(),
            EventDeliveryChannel.InApp,
            cancellationToken);
        _eventDeliveryRepository.RemoveRange(deliveries);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static InAppNotificationResult Map(EventDelivery delivery) => new()
    {
        GlobalId = delivery.GlobalId,
        Type = delivery.DomainEvent.Type,
        OccurredAt = delivery.DomainEvent.OccurredAt,
        EntityGlobalId = delivery.DomainEvent.EntityGlobalId,
        Summary = delivery.DomainEvent.Summary,
        ReadAt = delivery.ReadAt
    };
}
