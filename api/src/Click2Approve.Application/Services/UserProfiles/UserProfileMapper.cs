using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.UserProfiles;

/// <summary>
/// Maps user profile domain models to user profile DTOs.
/// </summary>
internal static class UserProfileMapper
{
    private const string AvatarRouteTemplate = "api/v1/userProfiles/{0}/avatar";

    public static async Task<UserProfileDto> MapUserProfileAsync(
        AppUser user,
        ITenantRepository tenantRepository,
        IUserNotificationPreferenceService notificationPreferenceService,
        CancellationToken cancellationToken)
    {
        return new UserProfileDto
        {
            FirstName = user.FirstName,
            LastName = user.LastName,
            Avatar = user.Avatar is null ? null : string.Format(AvatarRouteTemplate, user.Id),
            DefaultTenantGlobalId = user.DefaultTenantId is null
                ? null
                : (await tenantRepository.GetAsync(user.DefaultTenantId.Value, cancellationToken))?.GlobalId,
            NotificationPreferences = await notificationPreferenceService.ListAsync(user, cancellationToken)
        };
    }
}
