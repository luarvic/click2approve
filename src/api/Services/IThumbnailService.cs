namespace api.Services;

// An interface that defines a contract for a service that generates thumbnails of files.
public interface IThumbnailService
{
    Task<HttpResponseMessage> CreateThumbnailAsync(string filename, byte[] data, CancellationToken cancellationToken);
}
