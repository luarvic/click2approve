namespace Click2Approve.WebApi.Models.Responses.UserProfiles;

/// <summary>
/// Represents editable profile data for the authenticated user.
/// </summary>
public class UserProfileResponse
{
    /// <summary>First name.</summary>
    public string? FirstName { get; set; }
    /// <summary>Last name.</summary>
    public string? LastName { get; set; }
    /// <summary>URL or reference for the user avatar.</summary>
    public string? Avatar { get; set; }
    /// <summary>Global identifier of the user’s default organization.</summary>
    public Guid? DefaultTenantGlobalId { get; set; }
    /// <summary>Saved default electronic signature data.</summary>
    public string? DefaultSignatureJson { get; set; }
    /// <summary>Notification delivery preferences for the user.</summary>
    public required List<UserNotificationPreferenceResponse> NotificationPreferences { get; set; }
}
