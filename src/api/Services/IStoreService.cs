namespace api.Services;

// Defines a contract for storing binary data logic.
public interface IStoreService
{
    Task AddFileAsync(string id, string filename, byte[] bytes, CancellationToken cancellationToken);
    Task<byte[]> GetFileAsync(string id, CancellationToken cancellationToken);
}
