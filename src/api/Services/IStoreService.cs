namespace api.Services;

// An interface that defines a contract for a service that stores a binary data.
public interface IStoreService
{
    Task AddFileAsync(string id, string filename, byte[] data, CancellationToken cancellationToken);
    Task<HttpResponseMessage> GetFileAsync(string id, CancellationToken cancellationToken);
}
