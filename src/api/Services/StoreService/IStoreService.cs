namespace api.Services;

// Defines a contract for a service that manages binary files.
public interface IStoreService
{
    Task AddFileAsync(string path, byte[] bytes, CancellationToken cancellationToken);
    Task<byte[]> GetFileAsync(string path, CancellationToken cancellationToken);
}
