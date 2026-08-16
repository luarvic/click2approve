using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.UserProfiles;

/// <summary>
/// Defines user profile operations.
/// </summary>
public interface IUserProfileService
{
    Task<UserProfileResult> GetAsync(AppUser user, CancellationToken cancellationToken);
    Task<UserProfileResult> UpdateAsync(AppUser user, UpdateUserProfileCommand payload, CancellationToken cancellationToken);
    Task<UserProfileResult> SetAvatarAsync(AppUser user, Guid avatarUserFileGlobalId, CancellationToken cancellationToken);
    Task<string> GetAvatarUrlAsync(Guid userGlobalId, CancellationToken cancellationToken);
    Task<UserProfileResult> DeleteAvatarAsync(AppUser user, CancellationToken cancellationToken);
}
