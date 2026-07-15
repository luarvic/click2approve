using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.UserProfiles;

/// <summary>
/// Defines user profile operations.
/// </summary>
public interface IUserProfileService
{
    Task<UserProfileDto> GetAsync(AppUser user, CancellationToken cancellationToken);
    Task<UserProfileDto> UpdateAsync(AppUser user, UserProfileUpdateDto payload, CancellationToken cancellationToken);
    Task<UserProfileDto> UploadAvatarAsync(AppUser user, IFormFile avatar, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadAvatarAsync(string userId, CancellationToken cancellationToken);
    Task<UserProfileDto> DeleteAvatarAsync(AppUser user, CancellationToken cancellationToken);
}
