using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Responses.UserProfiles;

/// <summary>
/// Represents a user's notification preference for one type and channel.
/// </summary>
public class UserNotificationPreferenceResponse
{
    public required NotificationType Type { get; set; }
    public required NotificationChannel Channel { get; set; }
    public required bool IsEnabled { get; set; }
}
