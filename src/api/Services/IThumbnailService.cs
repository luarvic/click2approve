namespace api.Services;

// Defines a contract for generating thumbnails logic.
public interface IThumbnailService
{
    Task<HttpResponseMessage> CreateThumbnailAsync(string filename, byte[] data, CancellationToken cancellationToken);
}
