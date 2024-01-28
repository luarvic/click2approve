using api.Extentions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

// A service that manages user files (uploads, gets, deletes, etc.).
public class FileService(IConfiguration configuration, FileManagerDbContext db, IStoreService storeService, IThumbnailService thumbnailService) : IFileService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly FileManagerDbContext _db = db;
    private readonly IStoreService _storeService = storeService;
    private readonly IThumbnailService _thumbnailService = thumbnailService;

    public async Task UploadFilesAsync(IFormFileCollection files, CancellationToken cancellationToken)
    {
        foreach (var file in files)
        {
            // Record new user file to the database.
            var userFile = new UserFile
            {
                Name = file.FileName,
                Type = Path.GetExtension(file.FileName),
                Created = DateTime.UtcNow,
            };
            var userFileEntry = await _db.UserFiles.AddAsync(userFile, cancellationToken);
            
            // Save the user file entity to the database to generate its Id.
            await _db.SaveChangesAsync(cancellationToken);
            var id = userFileEntry.Entity.Id.ToString();

            // Save the file.
            var bytes = await file.ToBytesAsync(cancellationToken);
            await _storeService.AddFileAsync(id, file.FileName, bytes, cancellationToken);
            
            // Generate a thumbnail.
            var thumbnailResponse = await _thumbnailService.CreateThumbnailAsync(file.FileName, bytes, cancellationToken);
            
            // Save the thumbnail.
            using var thumbnailStream = await thumbnailResponse.Content.ReadAsStreamAsync(cancellationToken);
            await _storeService.AddFileAsync($"{id}-thumbnail", $"{id}-thumbnail.png", await thumbnailStream.ToBytesAsync(cancellationToken), cancellationToken);
        }
    }

    public async Task<HttpResponseMessage> DownloadFileAsync(long id, CancellationToken cancellationToken)
    {
        var userFile = await _db.UserFiles.SingleAsync(f => f.Id == id, cancellationToken: cancellationToken);
        var response = await _storeService.GetFileAsync(userFile.Id.ToString(), cancellationToken);
        return response;
    }
}
