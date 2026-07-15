namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents editable profile data for the authenticated user.
/// </summary>
public class UserProfileDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Avatar { get; set; }
    public long? DefaultTenantId { get; set; }
    public required List<UserNotificationPreferenceDto> NotificationPreferences { get; set; }
}
