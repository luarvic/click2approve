namespace Click2Approve.WebApi.Services.StoreService;

/// <summary>
/// Defines a contract for a service that manages binary files.
/// </summary>
public interface IStoreService
{
    Task AddFileAsync(string path, byte[] bytes, CancellationToken cancellationToken);
    Task<byte[]> GetFileAsync(string path, CancellationToken cancellationToken);
    void DeleteFile(string path);
}
