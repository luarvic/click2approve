using api.Models;

namespace api.Services;

public class FileService : IFileService
{
    private readonly IConfiguration _configuration;
    private readonly FileManagerDbContext _db;

    public FileService(IConfiguration configuration, FileManagerDbContext db)
    {
        _configuration = configuration;
        _db = db;
    }

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
            await _db.SaveChangesAsync();
            userFiles.Add(userFileEntry.Entity);
            await SaveFileAsync(file, userFileEntry.Entity.Id.ToString());
        }
        return userFiles;
    }

    private async Task SaveFileAsync(IFormFile file, string subdirectory)
    {
        var basePath = _configuration["FileStorage:BasePath"];
        if (string.IsNullOrWhiteSpace(basePath))
        {
            throw new Exception("FileStorage:BasePath is not defined in appsettings.json.");
        }
        var subdirectoryPath = $"{basePath}/{subdirectory}";
        if (!Path.Exists(subdirectoryPath))
        {
            Directory.CreateDirectory(subdirectoryPath);
        }
        var filePath = $"{subdirectoryPath}/{file.FileName}";
        using var stream = File.Create(filePath);
        await file.CopyToAsync(stream);
    }
}
