namespace Click2Approve.Application.Abstractions.FileStorage;

/// <summary>
/// Defines a contract for public binary file storage.
/// </summary>
public interface IPublicFileStorage
{
    Task SaveAsync(string path, byte[] bytes, CancellationToken cancellationToken);
    Task DeleteAsync(string path, CancellationToken cancellationToken);
    string GetUrl(string path);
}
