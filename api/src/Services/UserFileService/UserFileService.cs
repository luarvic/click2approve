using System.Collections.Concurrent;
using System.IO.Compression;
using api.Extensions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

// Implements a service that manages user files.
public class UserFileService(
    IAuditLogService auditLogService,
    IApprovalRequestService approvalRequestService,
    IConfiguration configuration,
    ApiDbContext db,
    IStoreService storeService,
    ILogger<UserFileService> logger) : IUserFileService
{
    private readonly IAuditLogService _auditLogService = auditLogService;
    private readonly IApprovalRequestService _approvalRequestService = approvalRequestService;
    private readonly IConfiguration _configuration = configuration;
    private readonly ApiDbContext _db = db;
    private readonly IStoreService _storeService = storeService;
    private readonly ILogger<UserFileService> _logger = logger;

    private async Task CheckLimitations(AppUser user, IFormFileCollection files, CancellationToken cancellationToken)
    {
        var maxFileCount = _configuration.GetValue<int>("Limitations:MaxFileCount");
        if (maxFileCount > 0)
        {
            var fileCount = await _db.UserFiles.CountAsync(f => f.Owner == user.Id, cancellationToken);
            if (fileCount + files.Count > maxFileCount)
            {
                throw new Exception($"Maximum file count ({maxFileCount}) is exceeded.");
            }
        }

        var maxFileSizeBytes = _configuration.GetValue<int>("Limitations:MaxFileSizeBytes");
        if (files.Any(file => file.Length > maxFileSizeBytes))
        {
            throw new Exception($"Maximum file size ({maxFileSizeBytes} bytes) is exceeded.");
        }
    }

    public async Task<IList<UserFile>> UploadAsync(AppUser user, IFormFileCollection files, CancellationToken cancellationToken)
    {
        await CheckLimitations(user, files, cancellationToken);

        // A collection of uploaded files to return.
        var userFiles = new List<UserFile>();
        foreach (var file in files)
        {
            // Record new user file to the database.
            var userFile = new UserFile
            {
                Name = file.FileName,
                Type = Path.GetExtension(file.FileName),
                Created = DateTime.UtcNow,
                Owner = user.Id,
                Size = file.Length
            };
            var userFileEntry = await _db.UserFiles.AddAsync(userFile, cancellationToken);
            userFiles.Add(userFileEntry.Entity);

            // Save the user file entity to the database to generate its Id.
            await _db.SaveChangesAsync(cancellationToken);
            var id = userFileEntry.Entity.Id.ToString();

            // Save the file.
            var bytes = await file.ToBytesAsync(cancellationToken);
            await _storeService.AddFileAsync(GetFilePath(user.Id, id, file.FileName), bytes, cancellationToken);

            // Add audit log entry.
            await _auditLogService.LogAsync(user.NormalizedEmail!,
                DateTime.UtcNow,
                "Uploaded user file",
                userFileEntry.Entity.ToString(),
                cancellationToken
            );
        }

        return userFiles;
    }

    private static string GetFilePath(string userId, string fileId, string fileName)
    {
        return Path.Combine(userId, fileId, fileName);
    }

    public async Task<(string Filename, byte[] Bytes)> DownloadAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var userFile = await _db.UserFiles
            .FirstAsync(f => f.Id == id &&
            (
                f.Owner == user.Id || // the user is either an owner
                f.ApprovalRequests.Any(r => r.Approvers.Any(a => a == user.NormalizedEmail)) // or an approver
            ), cancellationToken: cancellationToken);
        return
        (
            userFile.Name,
            await _storeService.GetFileAsync(GetFilePath(userFile.Owner, userFile.Id.ToString(), userFile.Name), cancellationToken)
        );
    }

    public async Task<(string Filename, byte[] Bytes)> DownloadArchiveAsync(AppUser user, long[] ids, CancellationToken cancellationToken)
    {
        var userFiles = await _db.UserFiles
            .Where(f => ids.Contains(f.Id) &&
            (
                f.Owner == user.Id || // the user is either an owner
                f.ApprovalRequests.Any(r => r.Approvers.Any(a => a == user.NormalizedEmail)) // or an approver
            ))
            .ToListAsync(cancellationToken);

        // Let's handle multiple files in parallel.
        var files = new ConcurrentDictionary<string, byte[]>();
        var tasks = new List<Task>();
        foreach (var userFile in userFiles)
        {
            tasks.Add(Task.Run(() =>
            _storeService.GetFileAsync(GetFilePath(userFile.Owner, userFile.Id.ToString(), userFile.Name), cancellationToken))
                .ContinueWith(bytes =>
                {
                    // Files can have same names.
                    var derivedFilename = $"{Path.GetFileNameWithoutExtension(userFile.Name)}-{userFile.Id}{userFile.Type}";
                    files.TryAdd(derivedFilename, bytes.Result);
                }, cancellationToken));
        }
        Task.WaitAll([.. tasks], cancellationToken);

        return await CompressAsync(files.ToDictionary(), cancellationToken);
    }

    private static async Task<(string Filename, byte[] Bytes)> CompressAsync(IDictionary<string, byte[]> files, CancellationToken cancellationToken)
    {
        using (var compressedFileStream = new MemoryStream())
        {
            using (var zipArchive = new ZipArchive(compressedFileStream, ZipArchiveMode.Create, false))
            {
                foreach (var file in files)
                {
                    var zipEntry = zipArchive.CreateEntry(file.Key);
                    using (var originalFileStream = new MemoryStream(file.Value))
                    using (var zipEntryStream = zipEntry.Open())
                    {
                        await originalFileStream.CopyToAsync(zipEntryStream);
                    }
                }
            }
            return ("archive.zip", compressedFileStream.ToArray());
        }
    }

    public async Task<IList<UserFile>> ListAsync(AppUser user, CancellationToken cancellationToken)
    {
        var userFiles = await _db.UserFiles.Where(f => f.Owner == user.Id).ToListAsync(cancellationToken);
        return userFiles;
    }

    public async Task DeleteAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        var userFile = await _db.UserFiles
            .Include(f => f.ApprovalRequests)
            .ThenInclude(r => r.Tasks)
            .FirstAsync(f => f.Id == id && f.Owner == user.Id, cancellationToken);
        var userFileJson = userFile.ToString();
        _db.UserFiles.Remove(userFile);
        await _db.SaveChangesAsync(cancellationToken);

        // Delete related approval requests.
        foreach (var approvalRequest in userFile.ApprovalRequests)
        {
            await _approvalRequestService.DeleteApprovalRequestAsync(user, approvalRequest.Id, cancellationToken);
        }

        // Delete the file.
        _storeService.DeleteFile(GetFilePath(user.Id, userFile.Id.ToString(), userFile.Name));

        // Add audit log entry.
        await _auditLogService.LogAsync(user.NormalizedEmail!,
            DateTime.UtcNow,
            "Deleted user file",
            userFileJson,
            cancellationToken
        );
    }
}
