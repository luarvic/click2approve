using System.Text.Json;
using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Abstractions.Services.Notifications;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;
using Click2Approve.EventConsumer.Services;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.EventConsumer.Handlers;

/// <summary>
/// Delivers a notification to the in-app inbox and its enabled delivery channels.
/// </summary>
public sealed class NotificationRequestedEventHandler(
    ApiDbContext db,
    IUserNotificationPreferenceService notificationPreferenceService,
    NotificationEmailService notificationEmailService,
    NotificationInAppService notificationInAppService) : IEventHandler
{
    private readonly ApiDbContext _db = db;
    private readonly IUserNotificationPreferenceService _notificationPreferenceService = notificationPreferenceService;
    private readonly NotificationEmailService _notificationEmailService = notificationEmailService;
    private readonly NotificationInAppService _notificationInAppService = notificationInAppService;

    public string EventType => EventTypes.NotificationRequestedV1;

    public async Task HandleAsync(EventEnvelope envelope, CancellationToken cancellationToken)
    {
        var payload = JsonSerializer.Deserialize<NotificationEventPayload>(envelope.Payload, EventJson.Options)
            ?? throw new InvalidOperationException("The notification event payload is invalid.");

        var recipient = await _db.Users.FirstOrDefaultAsync(user => user.Id == payload.UserId, cancellationToken);
        if (recipient is null) return;

        var preferences = await _notificationPreferenceService.ListAsync(recipient, cancellationToken);
        var isInAppEnabled = preferences.Single(preference =>
            preference.Type == payload.Type && preference.Channel == NotificationChannel.InApp).IsEnabled;
        var isEmailEnabled = preferences.Single(preference =>
            preference.Type == payload.Type && preference.Channel == NotificationChannel.Email).IsEnabled;

        if (isInAppEnabled)
        {
            await _notificationInAppService.SendAsync(envelope, payload, cancellationToken);
        }

        if (isEmailEnabled)
        {
            await _notificationEmailService.SendAsync(recipient, payload, cancellationToken);
        }
    }
}
