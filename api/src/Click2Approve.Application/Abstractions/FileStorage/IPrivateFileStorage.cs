namespace Click2Approve.Application.Abstractions.FileStorage;

/// <summary>
/// Defines a contract for private binary file storage.
/// </summary>
public interface IPrivateFileStorage
{
    Task SaveAsync(string path, byte[] bytes, CancellationToken cancellationToken);
    Task<byte[]> ReadAsync(string path, CancellationToken cancellationToken);
    Task DeleteAsync(string path, CancellationToken cancellationToken);
}
