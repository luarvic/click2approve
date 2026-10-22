using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.Notifications;

/// <summary>
/// Defines user notification preference operations.
/// </summary>
public interface IUserNotificationPreferenceService
{
    Task<List<UserNotificationPreferenceResult>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task ReplaceAsync(AppUser user, List<UserNotificationPreferenceCommand> preferences, CancellationToken cancellationToken);
    Task<bool> IsEnabledAsync(AppUser user, NotificationType type, NotificationChannel channel, CancellationToken cancellationToken);
}
