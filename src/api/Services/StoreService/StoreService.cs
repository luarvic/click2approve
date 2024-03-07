namespace api.Services;

// Implements a service that manages binary files.
public class StoreService(IConfiguration configuration, ILogger<StoreService> logger) : IStoreService
{
    private readonly ILogger<StoreService> _logger = logger;
    private readonly string _rootPath = configuration["FileStorage:RootPath"] ?? throw new Exception("File storage root path is not defined.");

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
            var errorMessage = $"Unable to create file {Path.GetFileName(path)}.";
            _logger.LogError(e, errorMessage);
            throw new Exception(errorMessage, e);
        }
    }

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
}
