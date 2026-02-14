namespace Click2Approve.WebApi.Services.StoreService;

/// <summary>
/// Implements a service that manages binary files.
/// </summary>
public class StoreService(IConfiguration configuration, IHostEnvironment hostEnvironment, ILogger<StoreService> logger) : IStoreService
{
    private readonly ILogger<StoreService> _logger = logger;
    private readonly string _rootPath = ResolveRootPath(configuration["FileStorage:RootPath"], hostEnvironment.ContentRootPath);

    /// <summary>
    /// Creates a file in the file system out of bytes.
    /// </summary>
    public async Task AddFileAsync(string path, byte[] bytes, CancellationToken cancellationToken)
    {
        try
        {
            var fullPath = Path.Combine(_rootPath, path);
            var directory = Path.GetDirectoryName(fullPath);
            if (directory != null && !Path.Exists(Path.GetDirectoryName(fullPath)))
            {
                Directory.CreateDirectory(directory);
            }
            using var fileStream = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write);
            await fileStream.WriteAsync(bytes, cancellationToken);
        }
        catch (Exception e)
        {
            throw new Exception($"Unable to create file {Path.GetFileName(path)}.", e);
        }
    }

    /// <summary>
    /// Deletes a file from the file system.
    /// </summary>
    public void DeleteFile(string path)
    {
        try
        {
            var fullPath = Path.Combine(_rootPath, path);
            var directory = Path.GetDirectoryName(fullPath);
            if (directory != null && Path.Exists(Path.GetDirectoryName(fullPath)))
            {
                Directory.Delete(directory, true);
            }
        }
        catch (Exception e)
        {
            throw new Exception($"Unable to delete file {Path.GetFileName(path)}.", e);
        }
    }

    /// <summary>
    /// Returns bytes out of the file.
    /// </summary>
    public async Task<byte[]> GetFileAsync(string path, CancellationToken cancellationToken)
    {
        try
        {
            var fullPath = Path.Combine(_rootPath, path);
            return await File.ReadAllBytesAsync(fullPath, cancellationToken);
        }
        catch (Exception e)
        {
            var errorMessage = $"Unable to read file {Path.GetFileName(path)}.";
            _logger.LogError(e, errorMessage);
            throw new Exception(errorMessage, e);
        }
    }

    private static string ResolveRootPath(string? configuredRootPath, string contentRootPath)
    {
        if (string.IsNullOrWhiteSpace(configuredRootPath))
        {
            throw new Exception("File storage root path is not defined.");
        }

        return Path.IsPathRooted(configuredRootPath)
            ? configuredRootPath
            : Path.GetFullPath(Path.Combine(contentRootPath, configuredRootPath));
    }
}
