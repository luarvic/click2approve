namespace Click2Approve.Application.Models.Commands.UserProfiles;

/// <summary>
/// Represents profile fields that can be updated by the authenticated user.
/// </summary>
public class UpdateUserProfileCommand
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Guid? DefaultTenantGlobalId { get; set; }
    public string? DefaultSignatureJson { get; set; }
    public required List<UserNotificationPreferenceCommand> NotificationPreferences { get; set; }
}
