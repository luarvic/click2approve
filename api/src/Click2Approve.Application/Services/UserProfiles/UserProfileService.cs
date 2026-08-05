using Click2Approve.Application.Extensions;
using Click2Approve.Application.Helpers;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity;

namespace Click2Approve.Application.Services.UserProfiles;

/// <summary>
/// Implements user profile operations.
/// </summary>
public class UserProfileService(
    UserManager<AppUser> userManager,
    ITenantRepository tenantRepository,
    IUserNotificationPreferenceService notificationPreferenceService,
    IUserProfileAccessService profileAccessService,
    IFileStorage fileStorage,
    IConfiguration configuration) : IUserProfileService
{
    private const string AllowedAvatarExtensionsConfigurationKey = "Limitations:AllowedAvatarExtensions";

    private readonly UserManager<AppUser> _userManager = userManager;
    private readonly ITenantRepository _tenantRepository = tenantRepository;
    private readonly IUserNotificationPreferenceService _notificationPreferenceService = notificationPreferenceService;
    private readonly IUserProfileAccessService _profileAccessService = profileAccessService;
    private readonly IFileStorage _fileStorage = fileStorage;
    private readonly IConfiguration _configuration = configuration;

    public async Task<UserProfileDto> GetAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await UserProfileMapper.MapUserProfileAsync(
            user,
            _tenantRepository,
            _notificationPreferenceService,
            cancellationToken);
    }

    public async Task<UserProfileDto> UpdateAsync(AppUser user, UserProfileUpdateDto payload, CancellationToken cancellationToken)
    {
        long? defaultTenantId = null;
        if (payload.DefaultTenantGlobalId is not null)
        {
            var defaultTenant = await _tenantRepository.GetAsync(payload.DefaultTenantGlobalId.Value, cancellationToken)
                ?? throw new BusinessRuleException("Default tenant was not found.");
            if (!await _profileAccessService.CanUseDefaultTenantAsync(user, defaultTenant.Id, cancellationToken))
            {
                throw new UnauthorizedAccessException();
            }

            defaultTenantId = defaultTenant.Id;
        }

        user.FirstName = UserProfileNameHelpers.NormalizeOptional(payload.FirstName);
        user.LastName = UserProfileNameHelpers.NormalizeOptional(payload.LastName);
        user.DefaultTenantId = defaultTenantId;
        await _notificationPreferenceService.ReplaceAsync(user, payload.NotificationPreferences, cancellationToken);
        await UpdateUserAsync(user);
        return await UserProfileMapper.MapUserProfileAsync(
            user,
            _tenantRepository,
            _notificationPreferenceService,
            cancellationToken);
    }

    public async Task<UserProfileDto> UploadAvatarAsync(AppUser user, IFormFile avatar, CancellationToken cancellationToken)
    {
        EnsureAvatarFile(avatar);

        var oldAvatarPath = user.Avatar;
        var extension = Path.GetExtension(avatar.FileName).ToLowerInvariant();
        var avatarPath = GetAvatarPath(user.Id, extension);
        var bytes = await avatar.ToBytesAsync(cancellationToken);
        await _fileStorage.SaveAsync(avatarPath, bytes, cancellationToken);

        user.Avatar = avatarPath;
        await UpdateUserAsync(user);

        if (!string.IsNullOrWhiteSpace(oldAvatarPath))
        {
            await _fileStorage.DeleteAsync(oldAvatarPath, cancellationToken);
        }

        return await UserProfileMapper.MapUserProfileAsync(
            user,
            _tenantRepository,
            _notificationPreferenceService,
            cancellationToken);
    }

    public async Task<(string Filename, byte[] Bytes)> DownloadAvatarAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new NotFoundException("User was not found.");
        var avatarPath = user.Avatar;
        if (string.IsNullOrWhiteSpace(avatarPath))
        {
            throw new NotFoundException("User avatar was not found.");
        }

        return (Path.GetFileName(avatarPath), await _fileStorage.ReadAsync(avatarPath, cancellationToken));
    }

    public async Task<UserProfileDto> DeleteAvatarAsync(AppUser user, CancellationToken cancellationToken)
    {
        var avatarPath = user.Avatar;
        if (string.IsNullOrWhiteSpace(avatarPath))
        {
            return await UserProfileMapper.MapUserProfileAsync(
                user,
                _tenantRepository,
                _notificationPreferenceService,
                cancellationToken);
        }

        user.Avatar = null;
        await UpdateUserAsync(user);
        await _fileStorage.DeleteAsync(avatarPath, cancellationToken);
        return await UserProfileMapper.MapUserProfileAsync(
            user,
            _tenantRepository,
            _notificationPreferenceService,
            cancellationToken);
    }

    private async Task UpdateUserAsync(AppUser user)
    {
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException("Failed to update the user profile.");
        }
    }

    private void EnsureAvatarFile(IFormFile avatar)
    {
        if (avatar.Length == 0)
        {
            throw new BusinessRuleException("Avatar image is required.");
        }

        var maxFileSizeBytes = _configuration.GetValue<int>("Limitations:MaxFileSizeBytes");
        if (maxFileSizeBytes > 0 && avatar.Length > maxFileSizeBytes)
        {
            throw new LimitExceededException($"The maximum file size ({maxFileSizeBytes} bytes) has been exceeded.");
        }

        var extension = Path.GetExtension(avatar.FileName).ToLowerInvariant();
        if (!GetAllowedAvatarExtensions().Contains(extension) || !HasImageContentType(avatar))
        {
            throw new BusinessRuleException("Avatar must be an image file.");
        }
    }

    private static bool HasImageContentType(IFormFile avatar)
    {
        return string.IsNullOrWhiteSpace(avatar.ContentType)
            || string.Equals(avatar.ContentType, "application/octet-stream", StringComparison.OrdinalIgnoreCase)
            || avatar.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
    }

    private static string GetAvatarPath(string userId, string extension)
    {
        return Path.Combine("users", userId, "avatars", $"{Guid.NewGuid():N}{extension}");
    }

    private HashSet<string> GetAllowedAvatarExtensions()
    {
        return _configuration
            .GetSection(AllowedAvatarExtensionsConfigurationKey)
            .GetChildren()
            .Select(extension => extension.Value)
            .Where(extension => !string.IsNullOrWhiteSpace(extension))
            .Select(extension => extension!.Trim().ToLowerInvariant())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }
}
