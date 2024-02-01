using System.Collections.Concurrent;
using System.IO.Compression;
using api.Extentions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

// A service that manages user files (uploads, gets, deletes, etc.).
public class FileService(
    IConfiguration configuration,
    FileManagerDbContext db,
    IStoreService storeService,
    IThumbnailService thumbnailService,
    ILogger<FileService> logger) : IFileService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly FileManagerDbContext _db = db;
    private readonly IStoreService _storeService = storeService;
    private readonly IThumbnailService _thumbnailService = thumbnailService;
    private readonly ILogger<FileService> _logger = logger;

    public async Task<IList<UserFile>> UploadFilesAsync(AppUser user, IFormFileCollection files, CancellationToken cancellationToken)
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
                Owner = user.Id
            };
            var userFileEntry = await _db.UserFiles.AddAsync(userFile, cancellationToken);
            userFiles.Add(userFileEntry.Entity);

            // Save the user file entity to the database to generate its Id.
            await _db.SaveChangesAsync(cancellationToken);
            var id = userFileEntry.Entity.Id.ToString();
            var thumbnailId = userFileEntry.Entity.Thumbnail;

            // Save the file.
            var bytes = await file.ToBytesAsync(cancellationToken);
            await _storeService.AddFileAsync(id, file.FileName, bytes, cancellationToken);

            // Generate a thumbnail.
            var thumbnailResponse = await _thumbnailService.CreateThumbnailAsync(file.FileName, bytes, cancellationToken);

            // Save the thumbnail.
            using var thumbnailStream = await thumbnailResponse.Content.ReadAsStreamAsync(cancellationToken);
            await _storeService.AddFileAsync(thumbnailId, thumbnailId, await thumbnailStream.ToBytesAsync(cancellationToken), cancellationToken);
        }

        return userFiles;
    }

    public async Task<(string Filename, byte[] Bytes)> GetFileAsync(AppUser user, string id, bool preview, CancellationToken cancellationToken)
    {
        var userFile = await _db.UserFiles.FirstAsync(f => f.Owner == user.Id && f.Id == long.Parse(id), cancellationToken: cancellationToken);
        return preview ?
            (userFile.Thumbnail, await _storeService.GetFileAsync(userFile.Thumbnail, cancellationToken)) :
            (userFile.Name, await _storeService.GetFileAsync(userFile.Id.ToString(), cancellationToken));
    }

    public async Task<(string Filename, byte[] Bytes)> GetArchiveAsync(AppUser user, string[] ids, CancellationToken cancellationToken)
    {
        var longIds = ids.Select(x => long.Parse(x));
        var userFiles = await _db.UserFiles.Where(f => f.Owner == user.Id && longIds.Contains(f.Id)).ToListAsync(cancellationToken);

        // Let's handle multiple files in parallel.
        var files = new ConcurrentDictionary<string, byte[]>();
        var tasks = new List<Task>();
        foreach (var userFile in userFiles)
        {
            tasks.Add(Task.Run(() =>
            _storeService.GetFileAsync(userFile.Id.ToString(), cancellationToken))
                .ContinueWith(bytes => files.TryAdd(userFile.Name, bytes.Result), cancellationToken));
        }
        Task.WaitAll([.. tasks], cancellationToken);

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
                        originalFileStream.CopyTo(zipEntryStream);
                    }
                }
            }
            return ("archive.zip", compressedFileStream.ToArray());
        }
    }

    public async Task<IList<UserFile>> GetUserFiles(AppUser user, CancellationToken cancellationToken)
    {
        var userFiles = await _db.UserFiles.Where(f => f.Owner == user.Id).ToListAsync(cancellationToken);
        return userFiles;
    }
}
