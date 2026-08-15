using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Persistence;

/// <summary>
/// Defines persistence operations for user notification preferences.
/// </summary>
public interface IUserNotificationPreferenceRepository
{
    Task<UserNotificationPreference> AddAsync(UserNotificationPreference preference, CancellationToken cancellationToken);
    Task<UserNotificationPreference?> GetAsync(long userId, NotificationType type, NotificationChannel channel, CancellationToken cancellationToken);
    Task<List<UserNotificationPreference>> ListAsync(long userId, CancellationToken cancellationToken);
    Task<List<UserNotificationPreference>> ListForUpdateAsync(long userId, CancellationToken cancellationToken);
}
