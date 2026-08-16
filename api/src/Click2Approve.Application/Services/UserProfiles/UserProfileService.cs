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
    IUserFileRepository userFileRepository,
    IUnitOfWork unitOfWork,
    ITenantContext tenantContext,
    IUserNotificationPreferenceService notificationPreferenceService,
    IUserProfileAccessService profileAccessService,
    IUserFileStorage fileStorage,
    IConfiguration configuration,
    ILogger<UserProfileService> logger) : IUserProfileService
{
    private const string AllowedAvatarExtensionsConfigurationKey = "Limitations:AllowedAvatarExtensions";

    private readonly IUserIdentityService _userIdentityService = userIdentityService;
    private readonly ITenantRepository _tenantRepository = tenantRepository;
    private readonly IUserFileRepository _userFileRepository = userFileRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ITenantContext _tenantContext = tenantContext;
    private readonly IUserNotificationPreferenceService _notificationPreferenceService = notificationPreferenceService;
    private readonly IUserProfileAccessService _profileAccessService = profileAccessService;
    private readonly IUserFileStorage _fileStorage = fileStorage;
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger<UserProfileService> _logger = logger;

    public async Task<UserProfileResult> GetAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await UserProfileMapper.MapUserProfileAsync(
            user,
            _tenantRepository,
            _userFileRepository,
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
            _userFileRepository,
            _notificationPreferenceService,
            _fileStorage,
            cancellationToken);
    }

    public async Task<UserProfileResult> SetAvatarAsync(AppUser user, UploadedFile avatar, CancellationToken cancellationToken)
    {
        EnsureAvatarFile(avatar);
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        var oldAvatar = user.AvatarUserFileId is null
            ? null
            : await _userFileRepository.GetPublicAsync(user.AvatarUserFileId.Value, cancellationToken);
        var avatarFile = await _userFileRepository.AddAsync(new UserFile
        {
            CreatedAt = DateTime.UtcNow,
            Name = Path.GetFileName(avatar.FileName),
            Owner = user,
            OwnerId = user.Id,
            Size = avatar.Length,
            Status = UserFileStatus.Attached,
            StorageType = UserFileStorageType.Public,
            TenantId = tenantId,
            Type = Path.GetExtension(avatar.FileName)
        }, cancellationToken);
        try
        {
            await _fileStorage.SaveAsync(avatarFile, avatar.Bytes, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            await CleanupAvatarUploadAsync(avatarFile);
            throw;
        }

        user.AvatarUserFileId = avatarFile.Id;
        user.AvatarUserFile = avatarFile;
        try
        {
            await UpdateUserAsync(user, cancellationToken);
        }
        catch
        {
            user.AvatarUserFileId = oldAvatar?.Id;
            user.AvatarUserFile = oldAvatar;
            await CleanupAvatarUploadAsync(avatarFile);
            throw;
        }

        if (oldAvatar is not null)
        {
            try
            {
                _userFileRepository.Remove(oldAvatar);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _fileStorage.DeleteAsync(oldAvatar, cancellationToken);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Failed to delete previous avatar file {UserFileGlobalId}.", oldAvatar.GlobalId);
            }
        }

        return await UserProfileMapper.MapUserProfileAsync(
            user,
            _tenantRepository,
            _userFileRepository,
            _notificationPreferenceService,
            _fileStorage,
            cancellationToken);
    }

    public async Task<string> GetAvatarUrlAsync(Guid userGlobalId, CancellationToken cancellationToken)
    {
        var user = await _userIdentityService.FindAsync(userGlobalId, cancellationToken)
            ?? throw new NotFoundException("User was not found.");
        if (user.AvatarUserFileId is null)
        {
            throw new NotFoundException("User avatar was not found.");
        }

        var avatar = await _userFileRepository.GetPublicAsync(user.AvatarUserFileId.Value, cancellationToken)
            ?? throw new NotFoundException("User avatar was not found.");
        return _fileStorage.GetPublicUrl(avatar);
    }

    public async Task<UserProfileResult> DeleteAvatarAsync(AppUser user, CancellationToken cancellationToken)
    {
        if (user.AvatarUserFileId is null)
        {
            return await UserProfileMapper.MapUserProfileAsync(
                user,
                _tenantRepository,
                _userFileRepository,
                _notificationPreferenceService,
                _fileStorage,
                cancellationToken);
        }

        var avatar = await _userFileRepository.GetPublicAsync(user.AvatarUserFileId.Value, cancellationToken)
            ?? throw new NotFoundException("User avatar was not found.");
        user.AvatarUserFileId = null;
        user.AvatarUserFile = null;
        await UpdateUserAsync(user, cancellationToken);
        _userFileRepository.Remove(avatar);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _fileStorage.DeleteAsync(avatar, cancellationToken);
        return await UserProfileMapper.MapUserProfileAsync(
            user,
            _tenantRepository,
            _userFileRepository,
            _notificationPreferenceService,
            _fileStorage,
            cancellationToken);
    }

    private async Task UpdateUserAsync(AppUser user, CancellationToken cancellationToken)
    {
        await _userIdentityService.UpdateAsync(user, cancellationToken);
    }

    private async Task CleanupAvatarUploadAsync(UserFile avatarFile)
    {
        _userFileRepository.Remove(avatarFile);
        try
        {
            await _unitOfWork.SaveChangesAsync(CancellationToken.None);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to clean up avatar user-file record {UserFileGlobalId}.", avatarFile.GlobalId);
        }

        try
        {
            await _fileStorage.DeleteAsync(avatarFile, CancellationToken.None);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to clean up avatar file {UserFileGlobalId}.", avatarFile.GlobalId);
        }
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
        if (!avatar.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)
            || !GetAllowedAvatarExtensions().Contains(extension))
        {
            throw new BusinessRuleException("Avatar must be an image file.");
        }
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
