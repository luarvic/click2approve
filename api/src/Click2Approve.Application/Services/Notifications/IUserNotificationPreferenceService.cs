using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.Notifications;

/// <summary>
/// Defines user notification preference operations.
/// </summary>
public interface IUserNotificationPreferenceService
{
    Task<List<UserNotificationPreferenceDto>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task ReplaceAsync(AppUser user, List<UserNotificationPreferenceDto> preferences, CancellationToken cancellationToken);
    Task<bool> IsEnabledAsync(string? userId, NotificationType type, NotificationChannel channel, CancellationToken cancellationToken);
}
