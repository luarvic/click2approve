namespace api.Services;

// An interface that defines a contract for a service that stores a binary data.
public interface IStoreService
{
    Task AddFileAsync(string id, string filename, byte[] bytes, CancellationToken cancellationToken);
    Task<byte[]> GetFileAsync(string id, CancellationToken cancellationToken);
}
