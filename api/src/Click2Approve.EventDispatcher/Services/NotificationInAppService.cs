using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;

namespace Click2Approve.EventDispatcher.Services;

/// <summary>
/// Creates durable in-app notifications for selected recipients.
/// </summary>
public sealed class NotificationInAppService(
    IInAppNotificationRepository inAppNotificationRepository,
    IUnitOfWork unitOfWork)
{
    private readonly IInAppNotificationRepository _inAppNotificationRepository = inAppNotificationRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    /// <summary>
    /// Creates the in-app notification unless this event was already delivered to the recipient.
    /// </summary>
    public async Task SendAsync(
        EventEnvelope envelope,
        NotificationEventPayload payload,
        CancellationToken cancellationToken)
    {
        if (await _inAppNotificationRepository.ExistsAsync(envelope.EventId, payload.UserId, cancellationToken)) return;

        await _inAppNotificationRepository.AddAsync(
            new InAppNotification
            {
                EntityGlobalId = payload.EntityGlobalId,
                EventId = envelope.EventId,
                Type = payload.Type,
                OccurredAt = envelope.OccurredAt,
                Summary = payload.Summary,
                TenantId = payload.TenantId,
                UserId = payload.UserId
            },
            cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
