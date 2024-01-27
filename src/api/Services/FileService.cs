using api.Helpers;
using api.Models;

namespace api.Services;

// A service that manages user files (uploads, gets, deletes, etc.).
public class FileService(IConfiguration configuration, FileManagerDbContext db) : IFileService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly FileManagerDbContext _db = db;

    public async Task<IList<IUserFile>> UploadFilesAsync(IFormFileCollection files)
    {
        var userFiles = new List<IUserFile>();
        foreach (var file in files)
        {
            var userFile = new UserFile
            {
                Name = file.FileName,
                Type = Path.GetExtension(file.FileName),
                Created = DateTime.UtcNow,
            };
            var userFileEntry = await _db.UserFiles.AddAsync(userFile);
            // Save the user file entity to the database to generate its Id.
            await _db.SaveChangesAsync();
            userFiles.Add(userFileEntry.Entity);
            // Save the user file to the file system under {basePath}/{Id} directory.
            // This ensures that files with the same name are not overwritten.
            // Also the directory is used to store file thumbnails (previews).
            await FileHelpers.SaveFileAsync(file, _configuration["FileStorage:BasePath"], userFileEntry.Entity.Id.ToString());
        }
        return userFiles;
    }
}
