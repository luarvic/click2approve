using System.Collections.Concurrent;
using System.IO.Compression;
using api.Extensions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

// Implements a service that manages user files.
public class UserFileService(
    IConfiguration configuration,
    ApiDbContext db,
    IStoreService storeService,
    ILogger<UserFileService> logger) : IUserFileService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly ApiDbContext _db = db;
    private readonly IStoreService _storeService = storeService;
    private readonly ILogger<UserFileService> _logger = logger;

    public async Task<IList<UserFile>> UploadAsync(AppUser user, IFormFileCollection files, CancellationToken cancellationToken)
    {
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
}
