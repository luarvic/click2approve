using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents a user's notification preference for one type and channel.
/// </summary>
public class UserNotificationPreferenceDto
{
    public required NotificationType Type { get; set; }
    public required NotificationChannel Channel { get; set; }
    public required bool IsEnabled { get; set; }
}
