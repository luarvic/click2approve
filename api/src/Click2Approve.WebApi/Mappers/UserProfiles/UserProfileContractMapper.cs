using Click2Approve.Application.Models.Commands.UserProfiles;
using Click2Approve.Application.Models.Results.UserProfiles;
using Click2Approve.WebApi.Models.Requests.UserProfiles;
using Click2Approve.WebApi.Models.Responses.UserProfiles;

namespace Click2Approve.WebApi.Mappers.UserProfiles;

/// <summary>
/// Maps user-profile HTTP contracts and application contracts.
/// </summary>
internal static class UserProfileContractMapper
{
    public static UpdateUserProfileCommand Map(UpdateUserProfileRequest request) => new()
    {
        DefaultSignatureJson = request.DefaultSignatureJson,
        DefaultTenantGlobalId = request.DefaultTenantGlobalId,
        FirstName = request.FirstName,
        LastName = request.LastName,
        NotificationPreferences = [.. request.NotificationPreferences.Select(preference => new UserNotificationPreferenceCommand
        {
            Channel = preference.Channel, IsEnabled = preference.IsEnabled, Type = preference.Type
        })]
    };

    public static UserProfileResponse Map(UserProfileResult result) => new()
    {
        Avatar = result.Avatar,
        DefaultSignatureJson = result.DefaultSignatureJson,
        DefaultTenantGlobalId = result.DefaultTenantGlobalId,
        FirstName = result.FirstName,
        LastName = result.LastName,
        NotificationPreferences = [.. result.NotificationPreferences.Select(preference => new UserNotificationPreferenceResponse
        {
            Channel = preference.Channel, IsEnabled = preference.IsEnabled, Type = preference.Type
        })]
    };
}
