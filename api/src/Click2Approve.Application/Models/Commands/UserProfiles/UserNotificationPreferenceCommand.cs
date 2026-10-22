using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Commands.UserProfiles;

/// <summary>
/// Represents a user's notification preference for one type and channel.
/// </summary>
public class UserNotificationPreferenceCommand
{
    public required NotificationType Type { get; set; }
    public required NotificationChannel Channel { get; set; }
    public required bool IsEnabled { get; set; }
}
