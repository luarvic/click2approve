using Click2Approve.Application.Models.Files;
using Click2Approve.Domain.Exceptions;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.UserFiles;

/// <summary>
/// Implements a service that manages user files.
/// </summary>
public class UserFileService(
    IConfiguration configuration,
    IUserFileRepository userFileRepository,
    ITenantContext tenantContext,
    IUnitOfWork unitOfWork,
    IUserFileStorage fileStorage,
    ILogger<UserFileService> logger) : IUserFileService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly IUserFileRepository _userFileRepository = userFileRepository;
    private readonly ITenantContext _tenantContext = tenantContext;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IUserFileStorage _fileStorage = fileStorage;
    private readonly ILogger<UserFileService> _logger = logger;

    /// <summary>
    /// Uploads a user file.
    /// </summary>
    public async Task<IList<UserFileResult>> UploadTemporaryAsync(AppUser user, IReadOnlyCollection<UploadedFile> files, CancellationToken cancellationToken)
    {
        await CheckLimitations(user, files, cancellationToken);
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);

        var userFiles = new List<UserFile>();
        try
        {
            foreach (var file in files)
            {
                var userFile = await _userFileRepository.AddAsync(new UserFile
                {
                    CreatedAt = DateTime.UtcNow,
                    Name = Path.GetFileName(file.FileName),
                    Owner = user,
                    OwnerId = user.Id,
                    Size = file.Length,
                    StorageType = UserFileStorageType.Temporary,
                    TenantId = tenantId,
                    Type = Path.GetExtension(file.FileName)
                }, cancellationToken);
                userFiles.Add(userFile);

                await _fileStorage.SaveAsync(userFile, file.Bytes, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }
        catch
        {
            await CleanupUploadAsync(userFiles);
            throw;
        }

        return [.. userFiles.Select(UserFileMapper.MapUserFile)];
    }

    public async Task PromoteToPrivateAsync(IReadOnlyCollection<UserFile> userFiles, CancellationToken cancellationToken)
    {
        var temporaryFiles = userFiles
            .Where(file => file.StorageType == UserFileStorageType.Temporary)
            .ToList();
        foreach (var userFile in temporaryFiles)
        {
            await _fileStorage.CopyToPrivateAsync(userFile, cancellationToken);
        }

        foreach (var userFile in temporaryFiles)
        {
            userFile.StorageType = UserFileStorageType.Private;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        foreach (var userFile in temporaryFiles)
        {
            try
            {
                userFile.StorageType = UserFileStorageType.Temporary;
                await _fileStorage.DeleteTemporaryAsync(userFile, CancellationToken.None);
                userFile.StorageType = UserFileStorageType.Private;
            }
            catch (Exception exception)
            {
                userFile.StorageType = UserFileStorageType.Private;
                _logger.LogError(exception, "Failed to delete temporary file {UserFileGlobalId} after promotion.", userFile.GlobalId);
            }
        }
    }

    public async Task PromoteToPublicAsync(IReadOnlyCollection<UserFile> userFiles, CancellationToken cancellationToken)
    {
        var temporaryFiles = userFiles
            .Where(file => file.StorageType == UserFileStorageType.Temporary)
            .ToList();
        foreach (var userFile in temporaryFiles)
        {
            await _fileStorage.CopyToPublicAsync(userFile, cancellationToken);
        }

        foreach (var userFile in temporaryFiles)
        {
            userFile.StorageType = UserFileStorageType.Public;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        foreach (var userFile in temporaryFiles)
        {
            try
            {
                userFile.StorageType = UserFileStorageType.Temporary;
                await _fileStorage.DeleteTemporaryAsync(userFile, CancellationToken.None);
                userFile.StorageType = UserFileStorageType.Public;
            }
            catch (Exception exception)
            {
                userFile.StorageType = UserFileStorageType.Public;
                _logger.LogError(exception, "Failed to delete temporary file {UserFileGlobalId} after public promotion.", userFile.GlobalId);
            }
        }
    }

    /// <summary>
    /// Downloads the user file.
    /// </summary>
    public async Task<(string Filename, byte[] Bytes)> DownloadAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var userFile = await _userFileRepository.GetForDownloadAsync(user, globalId, cancellationToken)
            ?? throw new NotFoundException("File was not found.");
        return await ReadAsync(userFile, cancellationToken);
    }

    /// <summary>
    /// Downloads a file attached to an approval request the user can access.
    /// </summary>
    public async Task<(string Filename, byte[] Bytes)> DownloadApprovalRequestAttachmentAsync(AppUser user, Guid globalId, Guid approvalRequestGlobalId, CancellationToken cancellationToken)
    {
        var userFile = await _userFileRepository.GetApprovalRequestAttachmentForDownloadAsync(user, globalId, approvalRequestGlobalId, cancellationToken)
            ?? throw new NotFoundException("File was not found.");
        return await ReadAsync(userFile, cancellationToken);
    }

    /// <summary>
    /// Downloads a file attached to an approval request task the user can access.
    /// </summary>
    public async Task<(string Filename, byte[] Bytes)> DownloadApprovalRequestAttachmentForTaskAsync(
        AppUser user,
        Guid globalId,
        Guid approvalRequestTaskGlobalId,
        CancellationToken cancellationToken)
    {
        var userFile = await _userFileRepository.GetApprovalRequestAttachmentForTaskDownloadAsync(
            user,
            globalId,
            approvalRequestTaskGlobalId,
            cancellationToken)
            ?? throw new NotFoundException("File was not found.");
        return await ReadAsync(userFile, cancellationToken);
    }

    /// <summary>Downloads a file attached directly to an approval request task.</summary>
    public async Task<(string Filename, byte[] Bytes)> DownloadApprovalRequestTaskAttachmentAsync(
        AppUser user,
        Guid globalId,
        Guid approvalRequestTaskGlobalId,
        CancellationToken cancellationToken)
    {
        var userFile = await _userFileRepository.GetApprovalRequestTaskAttachmentForDownloadAsync(
            user,
            globalId,
            approvalRequestTaskGlobalId,
            cancellationToken)
            ?? throw new NotFoundException("File was not found.");
        return await ReadAsync(userFile, cancellationToken);
    }

    /// <summary>Downloads a file attached to a discussion message visible to the user.</summary>
    public async Task<(string Filename, byte[] Bytes)> DownloadDiscussionMessageAttachmentAsync(
        AppUser user,
        Guid globalId,
        Guid discussionMessageGlobalId,
        CancellationToken cancellationToken)
    {
        var userFile = await _userFileRepository.GetDiscussionMessageAttachmentForDownloadAsync(
            user,
            globalId,
            discussionMessageGlobalId,
            cancellationToken)
            ?? throw new NotFoundException("File was not found.");
        return await ReadAsync(userFile, cancellationToken);
    }

    private async Task<(string Filename, byte[] Bytes)> ReadAsync(UserFile userFile, CancellationToken cancellationToken)
    {
        return
        (
            userFile.Name,
            await _fileStorage.ReadAsync(userFile, cancellationToken)
        );
    }

    private async Task CleanupUploadAsync(IEnumerable<UserFile> userFiles)
    {
        var files = userFiles.ToList();
        foreach (var userFile in files)
        {
            _userFileRepository.Remove(userFile);
        }

        try
        {
            await _unitOfWork.SaveChangesAsync(CancellationToken.None);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to clean up user-file records after an upload failure.");
        }

        foreach (var userFile in files)
        {
            try
            {
                await _fileStorage.DeleteAsync(userFile, CancellationToken.None);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Failed to clean up stored user file {UserFileGlobalId} after an upload failure.", userFile.GlobalId);
            }
        }
    }

    /// <summary>
    /// Lists the user files.
    /// </summary>
    public async Task<IList<UserFileResult>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var userFiles = await _userFileRepository.ListAsync(user, cancellationToken);
        return [.. userFiles.Select(UserFileMapper.MapUserFile)];
    }

    /// <summary>
    /// Deletes the user file.
    /// </summary>
    public async Task DeleteAsync(AppUser user, Guid globalId, CancellationToken cancellationToken)
    {
        var userFile = await _userFileRepository.GetForDeleteAsync(user, globalId, cancellationToken)
            ?? throw new NotFoundException("File was not found.");
        _userFileRepository.Remove(userFile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _fileStorage.DeleteAsync(userFile, cancellationToken);
    }

    /// <summary>
    /// Checks the limitations defined for user files and throws
    /// when any of them is exceeded.
    /// </summary>
    private async Task CheckLimitations(AppUser user, IReadOnlyCollection<UploadedFile> files, CancellationToken cancellationToken)
    {
        var maxFiles = _configuration.GetValue<int>("Limitations:MaxFiles");
        if (maxFiles > 0)
        {
            var fileCount = await _userFileRepository.CountAsync(user, cancellationToken);
            if (fileCount + files.Count > maxFiles)
            {
                throw new LimitExceededException($"The maximum number of files ({maxFiles}) has been exceeded.");
            }
        }

        var maxFileSizeBytes = _configuration.GetValue<int>("Limitations:MaxFileSizeBytes");
        if (files.Any(file => file.Length > maxFileSizeBytes))
        {
            throw new LimitExceededException($"The maximum file size ({maxFileSizeBytes} bytes) has been exceeded.");
        }
    }

}
