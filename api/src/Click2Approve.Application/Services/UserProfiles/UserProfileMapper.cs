using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.UserProfiles;

/// <summary>
/// Maps user profile domain models to user profile DTOs.
/// </summary>
internal static class UserProfileMapper
{
    public static async Task<UserProfileDto> MapUserProfileAsync(
        AppUser user,
        ITenantRepository tenantRepository,
        IUserNotificationPreferenceService notificationPreferenceService,
        IPublicFileStorage fileStorage,
        CancellationToken cancellationToken)
    {
        return new UserProfileDto
        {
            FirstName = user.FirstName,
            LastName = user.LastName,
            Avatar = user.Avatar is null ? null : fileStorage.GetUrl(user.Avatar),
            DefaultTenantGlobalId = user.DefaultTenantId is null
                ? null
                : (await tenantRepository.GetAsync(user.DefaultTenantId.Value, cancellationToken))?.GlobalId,
            DefaultSignatureJson = user.DefaultSignatureJson,
            NotificationPreferences = await notificationPreferenceService.ListAsync(user, cancellationToken)
        };
    }
}
