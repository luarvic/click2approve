namespace Click2Approve.WebApi.Models.Requests.UserProfiles;

/// <summary>
/// Represents profile fields that can be updated by the authenticated user.
/// </summary>
public class UpdateUserProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Guid? DefaultTenantGlobalId { get; set; }
    public string? DefaultSignatureJson { get; set; }
    public required List<UserNotificationPreferenceRequest> NotificationPreferences { get; set; }
}
