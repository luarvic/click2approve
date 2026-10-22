using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Requests.UserProfiles;

/// <summary>
/// Represents a user's notification preference for one type and channel.
/// </summary>
public class UserNotificationPreferenceRequest
{
    /// <summary>Notification type controlled by this preference.</summary>
    public required NotificationType Type { get; set; }
    /// <summary>Delivery channel for this notification preference.</summary>
    public required NotificationChannel Channel { get; set; }
    /// <summary>Whether this notification preference is enabled.</summary>
    public required bool IsEnabled { get; set; }
}
