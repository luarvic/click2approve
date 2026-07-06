using Click2Approve.Application.Services.FileStorage;
using Click2Approve.Domain.Exceptions;

namespace Click2Approve.Infrastructure.Services.FileStorage;

/// <summary>
/// Stores binary files on the local file system.
/// </summary>
public class FileSystemFileStorage(IConfiguration configuration, IHostEnvironment hostEnvironment) : IFileStorage
{
    private readonly string _rootPath = ResolveRootPath(configuration["FileStorage:RootPath"], hostEnvironment.ContentRootPath);

    /// <summary>
    /// Saves bytes to a file.
    /// </summary>
    public async Task SaveAsync(string path, byte[] bytes, CancellationToken cancellationToken)
    {
        try
        {
            var fullPath = Path.Combine(_rootPath, path);
            var directory = Path.GetDirectoryName(fullPath);
            if (directory is not null && !Path.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            using var fileStream = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write);
            await fileStream.WriteAsync(bytes, cancellationToken);
        }
        catch (Exception e)
        {
            throw new InfrastructureException($"Failed to create file at path: {path}.", e);
        }
    }

    /// <summary>
    /// Deletes a file.
    /// </summary>
    public Task DeleteAsync(string path, CancellationToken cancellationToken)
    {
        try
        {
            cancellationToken.ThrowIfCancellationRequested();
            var fullPath = Path.Combine(_rootPath, path);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
        catch (Exception e)
        {
            throw new InfrastructureException($"Failed to delete file at path: {path}.", e);
        }

        return Task.CompletedTask;
    }

    /// <summary>
    /// Reads bytes from a file.
    /// </summary>
    public async Task<byte[]> ReadAsync(string path, CancellationToken cancellationToken)
    {
        try
        {
            var fullPath = Path.Combine(_rootPath, path);
            return await File.ReadAllBytesAsync(fullPath, cancellationToken);
        }
        catch (Exception e)
        {
            throw new InfrastructureException($"Failed to read file at path: {path}.", e);
        }
    }

    private static string ResolveRootPath(string? configuredRootPath, string contentRootPath)
    {
        if (string.IsNullOrWhiteSpace(configuredRootPath))
        {
            throw new InfrastructureException("File storage configuration is invalid.");
        }

        return Path.IsPathRooted(configuredRootPath)
            ? configuredRootPath
            : Path.GetFullPath(Path.Combine(contentRootPath, configuredRootPath));
    }
}
