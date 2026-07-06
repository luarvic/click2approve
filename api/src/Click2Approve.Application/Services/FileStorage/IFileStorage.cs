namespace Click2Approve.Application.Services.FileStorage;

/// <summary>
/// Defines a contract for binary file storage.
/// </summary>
public interface IFileStorage
{
    Task SaveAsync(string path, byte[] bytes, CancellationToken cancellationToken);
    Task<byte[]> ReadAsync(string path, CancellationToken cancellationToken);
    Task DeleteAsync(string path, CancellationToken cancellationToken);
}
