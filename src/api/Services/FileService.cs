using api.Models;

namespace api.Services;

public class FileService : IFileService
{
    private readonly IConfiguration _configuration;

    public FileService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<IList<IUserFile>> UploadFilesAsync(IFormFileCollection files)
    {
        var userFiles = new List<IUserFile>();
        foreach (var file in files)
        {
            try
            {
                var basePath = _configuration["FileStorage:BasePath"];
                if (string.IsNullOrWhiteSpace(basePath))
                {
                    throw new Exception("FileStorage:BasePath is not defined in appsettings.json.");
                }
                if (!Path.Exists(basePath))
                {
                    Directory.CreateDirectory(basePath);
                }
                var path = $"{basePath}/{file.FileName}";
                using var stream = File.Create(path);
                await file.CopyToAsync(stream);
            }
            catch (Exception)
            {
                throw;
            }
            userFiles.Add(new UserFile
            {
                Name = file.FileName
            });
        }
        return userFiles;
    }
}
