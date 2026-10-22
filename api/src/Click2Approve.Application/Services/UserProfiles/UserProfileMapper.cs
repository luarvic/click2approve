using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.UserProfiles;

/// <summary>
/// Maps user profile domain models to user profile results.
/// </summary>
internal static class UserProfileMapper
{
    public static async Task<UserProfileResult> MapUserProfileAsync(
        AppUser user,
        ITenantRepository tenantRepository,
        IUserFileRepository userFileRepository,
        IUserNotificationPreferenceService notificationPreferenceService,
        IUserFileStorage fileStorage,
        CancellationToken cancellationToken)
    {
        return new UserProfileResult
        {
            FirstName = user.FirstName,
            LastName = user.LastName,
            Avatar = user.AvatarUserFileId is null
                ? null
                : (await userFileRepository.GetPublicAsync(user.AvatarUserFileId.Value, cancellationToken)) is { } avatar
                    ? fileStorage.GetPublicUrl(avatar)
                    : null,
            DefaultTenantGlobalId = user.DefaultTenantId is null
                ? null
                : (await tenantRepository.GetAsync(user.DefaultTenantId.Value, cancellationToken))?.GlobalId,
            DefaultSignatureJson = user.DefaultSignatureJson,
            NotificationPreferences = await notificationPreferenceService.ListAsync(user, cancellationToken)
        };
    }
}
