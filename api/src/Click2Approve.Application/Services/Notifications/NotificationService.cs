using System.Text.Json;
using Click2Approve.Application.Models.Commands.Notifications;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.Notifications;

/// <summary>
/// Sends notifications and manages the durable in-app notification inbox.
/// </summary>
public class NotificationService(
    IInAppNotificationRepository inAppNotificationRepository,
    IEventOutboxRepository eventOutboxRepository,
    IUnitOfWork unitOfWork) : INotificationService
{
    private readonly IInAppNotificationRepository _inAppNotificationRepository = inAppNotificationRepository;
    private readonly IEventOutboxRepository _eventOutboxRepository = eventOutboxRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task SendAsync(IReadOnlyCollection<NotificationCommand> notifications, CancellationToken cancellationToken)
    {
        foreach (var notification in notifications)
        {
            foreach (var recipient in notification.Recipients.Distinct())
            {
                var payload = new NotificationEventPayload(
                    notification.Type,
                    notification.TenantId,
                    notification.EntityGlobalId,
                    notification.Summary,
                    recipient.UserId);
                await _eventOutboxRepository.AddAsync(
                    new EventOutboxMessage
                    {
                        EventId = Guid.NewGuid(),
                        EventType = EventTypes.NotificationRequestedV1,
                        OccurredAt = DateTime.UtcNow,
                        Payload = JsonSerializer.Serialize(payload, EventJson.Options)
                    },
                    cancellationToken);
            }
        }
    }

    public Task<long> CountInAppUnreadAsync(AppUser user, long tenantId, CancellationToken cancellationToken) =>
        _inAppNotificationRepository.CountUnreadAsync(user.Id, tenantId, cancellationToken);

    public async Task<GridPageResult<InAppNotificationResult>> ListInAppAsync(
        AppUser user,
        long tenantId,
        InAppNotificationListQueryCommand query,
        CancellationToken cancellationToken)
    {
        var page = await _inAppNotificationRepository.ListAsync(user.Id, tenantId, query, cancellationToken);
        return new GridPageResult<InAppNotificationResult>
        {
            Items = [.. page.Items.Select(Map)],
            TotalCount = page.TotalCount
        };
    }

    public async Task MarkInAppReadAsync(
        AppUser user,
        long tenantId,
        Guid notificationGlobalId,
        CancellationToken cancellationToken)
    {
        var notification = await _inAppNotificationRepository.GetForReadAsync(
            user.Id,
            tenantId,
            notificationGlobalId,
            cancellationToken) ?? throw new NotFoundException("Notification was not found.");
        notification.ReadAt ??= DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkAllInAppReadAsync(AppUser user, long tenantId, CancellationToken cancellationToken)
    {
        var notifications = await _inAppNotificationRepository.ListUnreadForReadAsync(user.Id, tenantId, cancellationToken);
        foreach (var notification in notifications) notification.ReadAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkInAppReadAsync(
        AppUser user,
        long tenantId,
        IReadOnlyCollection<Guid> notificationGlobalIds,
        CancellationToken cancellationToken)
    {
        var notifications = await _inAppNotificationRepository.ListForReadAsync(
            user.Id,
            tenantId,
            notificationGlobalIds.Distinct().ToArray(),
            cancellationToken);
        foreach (var notification in notifications) notification.ReadAt ??= DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteInAppAsync(
        AppUser user,
        long tenantId,
        IReadOnlyCollection<Guid> notificationGlobalIds,
        CancellationToken cancellationToken)
    {
        var notifications = await _inAppNotificationRepository.ListForReadAsync(
            user.Id,
            tenantId,
            notificationGlobalIds.Distinct().ToArray(),
            cancellationToken);
        _inAppNotificationRepository.RemoveRange(notifications);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static InAppNotificationResult Map(InAppNotification notification) => new()
    {
        GlobalId = notification.GlobalId,
        Type = notification.Type,
        OccurredAt = notification.OccurredAt,
        EntityGlobalId = notification.EntityGlobalId,
        Summary = notification.Summary,
        ReadAt = notification.ReadAt
    };
}
