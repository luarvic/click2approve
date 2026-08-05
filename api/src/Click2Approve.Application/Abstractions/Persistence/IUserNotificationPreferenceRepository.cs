using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Persistence;

/// <summary>
/// Defines persistence operations for user notification preferences.
/// </summary>
public interface IUserNotificationPreferenceRepository
{
    Task<UserNotificationPreference> AddAsync(UserNotificationPreference preference, CancellationToken cancellationToken);
    Task<UserNotificationPreference?> GetAsync(string userId, NotificationType type, NotificationChannel channel, CancellationToken cancellationToken);
    Task<List<UserNotificationPreference>> ListAsync(string userId, CancellationToken cancellationToken);
    Task<List<UserNotificationPreference>> ListForUpdateAsync(string userId, CancellationToken cancellationToken);
}
