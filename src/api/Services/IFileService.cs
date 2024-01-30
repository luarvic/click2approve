using api.Models;

namespace api.Services;

// An interface that defines a contract for a service that manages user files (uploads, gets, deletes, etc.).
public interface IFileService
{
    Task<IList<UserFile>> UploadFilesAsync(AppUser user, IFormFileCollection files, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> GetFileAsync(AppUser user, string id, bool preview, CancellationToken cancellationToken);
    Task<IList<UserFile>> GetUserFiles(AppUser user, CancellationToken cancellationToken);
}
