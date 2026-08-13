using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.Notifications;

/// <summary>
/// Implements user notification preference operations.
/// </summary>
public class UserNotificationPreferenceService(IUserNotificationPreferenceRepository notificationPreferenceRepository)
    : IUserNotificationPreferenceService
{
    private readonly IUserNotificationPreferenceRepository _notificationPreferenceRepository = notificationPreferenceRepository;

    public async Task<List<UserNotificationPreferenceResult>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var savedPreferences = await _notificationPreferenceRepository.ListAsync(user.Id, cancellationToken);

        return [.. AllEmailTypes().Select(type =>
        {
            var preference = savedPreferences.FirstOrDefault(p => p.Type == type && p.Channel == NotificationChannel.Email);
            return new UserNotificationPreferenceResult
            {
                Type = type,
                Channel = NotificationChannel.Email,
                IsEnabled = preference?.IsEnabled ?? true
            };
        })];
    }

    public async Task ReplaceAsync(AppUser user, List<UserNotificationPreferenceCommand> preferences, CancellationToken cancellationToken)
    {
        var requestedPreferences = preferences
            .Where(preference => preference.Channel == NotificationChannel.Email && AllEmailTypes().Contains(preference.Type))
            .GroupBy(preference => new { preference.Type, preference.Channel })
            .Select(group => group.Last())
            .ToList();

        var existingPreferences = await _notificationPreferenceRepository.ListForUpdateAsync(user.Id, cancellationToken);

        foreach (var requestedPreference in requestedPreferences)
        {
            var existingPreference = existingPreferences.FirstOrDefault(preference =>
                preference.Type == requestedPreference.Type && preference.Channel == requestedPreference.Channel);
            if (existingPreference is null)
            {
                await _notificationPreferenceRepository.AddAsync(new UserNotificationPreference
                {
                    UserId = user.Id,
                    User = user,
                    Type = requestedPreference.Type,
                    Channel = requestedPreference.Channel,
                    IsEnabled = requestedPreference.IsEnabled
                }, cancellationToken);
                continue;
            }

            existingPreference.IsEnabled = requestedPreference.IsEnabled;
        }
    }

    public async Task<bool> IsEnabledAsync(string? userId, NotificationType type, NotificationChannel channel, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return true;
        }

        var preference = await _notificationPreferenceRepository.GetAsync(userId, type, channel, cancellationToken);
        return preference?.IsEnabled ?? true;
    }

    private static NotificationType[] AllEmailTypes()
    {
        return
        [
            NotificationType.ApprovalRequestTaskCreated,
            NotificationType.ApprovalRequestCancelled,
            NotificationType.ApprovalRequestReviewed
        ];
    }
}
