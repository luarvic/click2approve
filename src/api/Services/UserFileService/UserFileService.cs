using System.Collections.Concurrent;
using System.IO.Compression;
using api.Extensions;
using api.Models;
using CSharpVitamins;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

// Implements user files management logic (uploads, gets, deletes, etc.).
public class UserFileService(
    IConfiguration configuration,
    FileManagerDbContext db,
    IStoreService storeService,
    ILogger<UserFileService> logger) : IUserFileService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly FileManagerDbContext _db = db;
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

    public async Task<(string Filename, byte[] Bytes)> DownloadAsync(AppUser user, string id, CancellationToken cancellationToken)
    {
        var userFile = await _db.UserFiles.FirstAsync(f => f.Id == long.Parse(id) && f.Owner == user.Id, cancellationToken: cancellationToken);
        return (
            userFile.Name,
            await _storeService.GetFileAsync(GetFilePath(userFile.Owner, userFile.Id.ToString(), userFile.Name), cancellationToken)
        );
    }

    public async Task<(string Filename, byte[] Bytes)> DownloadArchiveAsync(AppUser user, string[] ids, CancellationToken cancellationToken)
    {
        var longIds = ids.Select(long.Parse).ToArray();
        var userFiles = await _db.UserFiles
            .Where(f => longIds.Contains(f.Id) && f.Owner == user.Id)
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

    public async Task<string> SendAsync(AppUser user, string[] ids, string[] approvers, DateTime approveBy, string? comment, CancellationToken cancellationToken)
    {
        var longIds = ids.Select(long.Parse);
        var userFiles = await _db.UserFiles
            .Where(f => longIds.Contains(f.Id) && f.Owner == user.Id)
            .ToListAsync(cancellationToken);
        ShortGuid id = Guid.NewGuid();
        foreach (var userFile in userFiles)
        {
            foreach (var approver in approvers)
            {
                _db.UserFilesForApproval.Add(new UserFileForApproval
                {
                    UserFile = userFile,
                    Approver = approver,
                    ApproveBy = approveBy,
                    SendDate = DateTime.UtcNow,
                    Comment = comment
                });
                await _db.SaveChangesAsync(cancellationToken);
            }
        }
        return id;
    }
}
