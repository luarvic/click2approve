namespace Click2Approve.WebApi.Models.Requests.UserProfiles;

/// <summary>
/// Represents profile fields that can be updated by the authenticated user.
/// </summary>
public class UpdateUserProfileRequest
{
    /// <summary>First name.</summary>
    public string? FirstName { get; set; }
    /// <summary>Last name.</summary>
    public string? LastName { get; set; }
    /// <summary>Global identifier of the user’s default organization.</summary>
    public Guid? DefaultTenantGlobalId { get; set; }
    /// <summary>Saved default electronic signature data.</summary>
    public string? DefaultSignatureJson { get; set; }
    /// <summary>Notification delivery preferences for the user.</summary>
    public required List<UserNotificationPreferenceRequest> NotificationPreferences { get; set; }
}
