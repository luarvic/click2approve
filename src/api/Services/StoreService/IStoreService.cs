namespace api.Services;

// Defines a contract for storing binary data logic.
public interface IStoreService
{
    Task AddFileAsync(string path, byte[] bytes, CancellationToken cancellationToken);
    Task<byte[]> GetFileAsync(string path, CancellationToken cancellationToken);
}
