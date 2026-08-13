using Click2Approve.Application.Models.Emails;
using Click2Approve.Application.Models.Files;
using Click2Approve.Application.Models.Notifications;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.UserProfiles;

/// <summary>
/// Defines user profile operations.
/// </summary>
public interface IUserProfileService
{
    Task<UserProfileResult> GetAsync(AppUser user, CancellationToken cancellationToken);
    Task<UserProfileResult> UpdateAsync(AppUser user, UpdateUserProfileCommand payload, CancellationToken cancellationToken);
    Task<UserProfileResult> UploadAvatarAsync(AppUser user, UploadedFile avatar, CancellationToken cancellationToken);
    Task<string> GetAvatarUrlAsync(string userId, CancellationToken cancellationToken);
    Task<UserProfileResult> DeleteAvatarAsync(AppUser user, CancellationToken cancellationToken);
}
