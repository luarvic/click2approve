namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a user's preference for one notification type and delivery channel.
/// </summary>
public class UserNotificationPreference : DbEntity
{
    // Foreign key identifiers
    public required long UserId { get; set; }

    // Scalar properties
    public required NotificationChannel Channel { get; set; }
    public required bool IsEnabled { get; set; }
    public required NotificationType Type { get; set; }

    // Navigation properties
    public AppUser User { get; set; } = null!;
}
