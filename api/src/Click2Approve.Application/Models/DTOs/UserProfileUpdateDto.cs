namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents profile fields that can be updated by the authenticated user.
/// </summary>
public class UserProfileUpdateDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public long? DefaultTenantId { get; set; }
    public required List<UserNotificationPreferenceDto> NotificationPreferences { get; set; }
}
