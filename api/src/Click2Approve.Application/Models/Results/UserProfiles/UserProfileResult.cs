namespace Click2Approve.Application.Models.Results.UserProfiles;

/// <summary>
/// Represents editable profile data for the authenticated user.
/// </summary>
public class UserProfileResult
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Avatar { get; set; }
    public Guid? DefaultTenantGlobalId { get; set; }
    public string? DefaultSignatureJson { get; set; }
    public required List<UserNotificationPreferenceResult> NotificationPreferences { get; set; }
}
