using Click2Approve.Application.Models.Files;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.UserProfiles;

/// <summary>
/// Implements user profile operations.
/// </summary>
public class UserProfileService(
    IUserIdentityService userIdentityService,
    ITenantRepository tenantRepository,
    IUserNotificationPreferenceService notificationPreferenceService,
    IUserProfileAccessService profileAccessService,
    IPublicFileStorage fileStorage,
    IConfiguration configuration) : IUserProfileService
{
    private const string AllowedAvatarExtensionsConfigurationKey = "Limitations:AllowedAvatarExtensions";

    private readonly IUserIdentityService _userIdentityService = userIdentityService;
    private readonly ITenantRepository _tenantRepository = tenantRepository;
    private readonly IUserNotificationPreferenceService _notificationPreferenceService = notificationPreferenceService;
    private readonly IUserProfileAccessService _profileAccessService = profileAccessService;
    private readonly IPublicFileStorage _fileStorage = fileStorage;
    private readonly IConfiguration _configuration = configuration;

    public async Task<UserProfileResult> GetAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await UserProfileMapper.MapUserProfileAsync(
            user,
            _tenantRepository,
            _notificationPreferenceService,
            _fileStorage,
            cancellationToken);
    }

    public async Task<UserProfileResult> UpdateAsync(AppUser user, UpdateUserProfileCommand payload, CancellationToken cancellationToken)
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

        user.FirstName = string.IsNullOrWhiteSpace(payload.FirstName) ? null : payload.FirstName.Trim();
        user.LastName = string.IsNullOrWhiteSpace(payload.LastName) ? null : payload.LastName.Trim();
        user.DefaultSignatureJson = GetDefaultSignatureJson(payload.DefaultSignatureJson);
        user.DefaultTenantId = defaultTenantId;
        await _notificationPreferenceService.ReplaceAsync(user, payload.NotificationPreferences, cancellationToken);
        await UpdateUserAsync(user, cancellationToken);
        return await UserProfileMapper.MapUserProfileAsync(
            user,
            _tenantRepository,
            _notificationPreferenceService,
            _fileStorage,
            cancellationToken);
    }

    public async Task<UserProfileResult> UploadAvatarAsync(AppUser user, UploadedFile avatar, CancellationToken cancellationToken)
    {
        EnsureAvatarFile(avatar);

        var oldAvatarPath = user.Avatar;
        var extension = Path.GetExtension(avatar.FileName).ToLowerInvariant();
        var avatarPath = GetAvatarPath(user.GlobalId, extension);
        await _fileStorage.SaveAsync(avatarPath, avatar.Bytes, cancellationToken);

        user.Avatar = avatarPath;
        await UpdateUserAsync(user, cancellationToken);

        if (!string.IsNullOrWhiteSpace(oldAvatarPath))
        {
            await _fileStorage.DeleteAsync(oldAvatarPath, cancellationToken);
        }

        return await UserProfileMapper.MapUserProfileAsync(
            user,
            _tenantRepository,
            _notificationPreferenceService,
            _fileStorage,
            cancellationToken);
    }

    public async Task<string> GetAvatarUrlAsync(Guid userGlobalId, CancellationToken cancellationToken)
    {
        var user = await _userIdentityService.FindAsync(userGlobalId, cancellationToken)
            ?? throw new NotFoundException("User was not found.");
        var avatarPath = user.Avatar;
        if (string.IsNullOrWhiteSpace(avatarPath))
        {
            throw new NotFoundException("User avatar was not found.");
        }

        return _fileStorage.GetUrl(avatarPath);
    }

    public async Task<UserProfileResult> DeleteAvatarAsync(AppUser user, CancellationToken cancellationToken)
    {
        var avatarPath = user.Avatar;
        if (string.IsNullOrWhiteSpace(avatarPath))
        {
            return await UserProfileMapper.MapUserProfileAsync(
                user,
                _tenantRepository,
                _notificationPreferenceService,
                _fileStorage,
                cancellationToken);
        }

        user.Avatar = null;
        await UpdateUserAsync(user, cancellationToken);
        await _fileStorage.DeleteAsync(avatarPath, cancellationToken);
        return await UserProfileMapper.MapUserProfileAsync(
            user,
            _tenantRepository,
            _notificationPreferenceService,
            _fileStorage,
            cancellationToken);
    }

    private async Task UpdateUserAsync(AppUser user, CancellationToken cancellationToken)
    {
        await _userIdentityService.UpdateAsync(user, cancellationToken);
    }

    private static string? GetDefaultSignatureJson(string? signatureJson)
    {
        var trimmedSignatureJson = string.IsNullOrWhiteSpace(signatureJson) ? null : signatureJson.Trim();
        if (trimmedSignatureJson?.Length > 16000)
        {
            throw new BusinessRuleException("Signature is too large.");
        }

        return trimmedSignatureJson;
    }

    private void EnsureAvatarFile(UploadedFile avatar)
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

    private static bool HasImageContentType(UploadedFile avatar)
    {
        return string.IsNullOrWhiteSpace(avatar.ContentType)
            || string.Equals(avatar.ContentType, "application/octet-stream", StringComparison.OrdinalIgnoreCase)
            || avatar.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
    }

    private static string GetAvatarPath(Guid userGlobalId, string extension)
    {
        return Path.Combine("users", userGlobalId.ToString(), "avatars", $"{Guid.NewGuid()}{extension}");
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
