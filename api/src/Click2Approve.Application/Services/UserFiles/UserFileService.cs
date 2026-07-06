using Click2Approve.Domain.Exceptions;
using Click2Approve.Application.Extensions;
using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;
using Click2Approve.Application.Services.ApprovalRequests;
using Click2Approve.Application.Services.AuditLogs;
using Click2Approve.Application.Services.FileStorage;
using Click2Approve.Application.Services.TenantContext;
using Click2Approve.Application.Services.UserFiles;

namespace Click2Approve.Application.Services.UserFiles;

/// <summary>
/// Implements a service that manages user files.
/// </summary>
public class UserFileService(
    IAuditLogService auditLogService,
    IApprovalRequestService approvalRequestService,
    IConfiguration configuration,
    IApprovalRequestRepository approvalRequestRepository,
    IUserFileRepository userFileRepository,
    ITenantContext tenantContext,
    IUnitOfWork unitOfWork,
    IFileStorage fileStorage,
    ILogger<UserFileService> logger) : IUserFileService
{
    private readonly IAuditLogService _auditLogService = auditLogService;
    private readonly IApprovalRequestService _approvalRequestService = approvalRequestService;
    private readonly IConfiguration _configuration = configuration;
    private readonly IApprovalRequestRepository _approvalRequestRepository = approvalRequestRepository;
    private readonly IUserFileRepository _userFileRepository = userFileRepository;
    private readonly ITenantContext _tenantContext = tenantContext;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IFileStorage _fileStorage = fileStorage;
    private readonly ILogger<UserFileService> _logger = logger;

    /// <summary>
    /// Uploads a user file.
    /// </summary>
    public async Task<IList<UserFile>> UploadAsync(AppUser user, IFormFileCollection files, CancellationToken cancellationToken)
    {
        await CheckLimitations(user, files, cancellationToken);
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);

        // A collection of uploaded files to return.
        var userFiles = new List<UserFile>();
        foreach (var file in files)
        {
            // Record new user file to the database.
            var userFile = new UserFile
            {
                Name = Path.GetFileName(file.FileName),
                Type = Path.GetExtension(file.FileName),
                Created = DateTime.UtcNow,
                OwnerId = user.Id,
                Owner = user,
                TenantId = tenantId,
                Size = file.Length
            };
            var savedUserFile = await _userFileRepository.AddAsync(userFile, cancellationToken);
            userFiles.Add(savedUserFile);

            // Save the user file entity to the database to generate its Id.
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            var id = savedUserFile.Id.ToString();

            // Save the file.
            var bytes = await file.ToBytesAsync(cancellationToken);
            await _fileStorage.SaveAsync(GetFilePath(user.Id, id, Path.GetFileName(file.FileName)), bytes, cancellationToken);

            // Add audit log entry.
            await _auditLogService.LogAsync(user,
                DateTime.UtcNow,
                "Uploaded user file",
                savedUserFile.ToString(),
                cancellationToken
            );
        }

        return userFiles;
    }

    /// <summary>
    /// Downloads the user file.
    /// </summary>
    public async Task<(string Filename, byte[] Bytes)> DownloadAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var userFile = await _userFileRepository.GetForDownloadAsync(user, id, cancellationToken);
        return
        (
            userFile.Name,
            await _fileStorage.ReadAsync(GetFilePath(userFile.OwnerId, userFile.Id.ToString(), userFile.Name), cancellationToken)
        );
    }

    /// <summary>
    /// Lists the user files.
    /// </summary>
    public async Task<IList<UserFile>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var userFiles = await _userFileRepository.ListByOwnerAsync(user, cancellationToken);
        return userFiles;
    }

    /// <summary>
    /// Deletes the user file.
    /// </summary>
    public async Task DeleteAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        // Delete related approval requests first.
        var approvalRequests = await _approvalRequestRepository.ListByUserFileIdAsync(user, id, cancellationToken);
        foreach (var approvalRequest in approvalRequests)
        {
            await _approvalRequestService.DeleteApprovalRequestAsync(user, approvalRequest.Id, cancellationToken);
        }

        // Delete the file.
        var userFile = await _userFileRepository.GetForDeleteAsync(user, id, cancellationToken);
        var userFileJson = userFile.ToString();
        _userFileRepository.Remove(userFile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _fileStorage.DeleteAsync(GetFilePath(user.Id, userFile.Id.ToString(), userFile.Name), cancellationToken);

        // Add audit log entry.
        await _auditLogService.LogAsync(user,
            DateTime.UtcNow,
            "Deleted user file",
            userFileJson,
            cancellationToken
        );
    }

    /// <summary>
    /// Checks the limitations defined for user files and throws
    /// when any of them is exceeded.
    /// </summary>
    private async Task CheckLimitations(AppUser user, IFormFileCollection files, CancellationToken cancellationToken)
    {
        var maxFiles = _configuration.GetValue<int>("Limitations:MaxFiles");
        if (maxFiles > 0)
        {
            var fileCount = await _userFileRepository.CountByOwnerAsync(user, cancellationToken);
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

    /// <summary>
    /// Gets the file path out of the user and file properties.
    /// </summary>
    private static string GetFilePath(string userId, string fileId, string fileName)
    {
        return Path.Combine(userId, fileId, fileName);
    }
}
