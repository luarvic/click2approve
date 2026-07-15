namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a user's preference for one notification type and delivery channel.
/// </summary>
public class UserNotificationPreference : DbEntity
{
    public required string UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public required NotificationType Type { get; set; }
    public required NotificationChannel Channel { get; set; }
    public required bool IsEnabled { get; set; }
}
