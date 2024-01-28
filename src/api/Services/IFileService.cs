namespace api.Services;

// An interface that defines a contract for a service that manages user files (uploads, gets, deletes, etc.).
public interface IFileService
{
    Task UploadFilesAsync(IFormFileCollection files, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> GetFileAsync(string id, bool preview, CancellationToken cancellationToken);
}
