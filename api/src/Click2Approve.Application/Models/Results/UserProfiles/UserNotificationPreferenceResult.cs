using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Results.UserProfiles;

/// <summary>
/// Represents a user's notification preference for one type and channel.
/// </summary>
public class UserNotificationPreferenceResult
{
    public required NotificationType Type { get; set; }
    public required NotificationChannel Channel { get; set; }
    public required bool IsEnabled { get; set; }
}
