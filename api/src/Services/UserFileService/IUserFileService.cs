using api.Models;

namespace api.Services;

// Defines a contract for a service that manages user files.
public interface IUserFileService
{
    Task<IList<UserFile>> UploadAsync(AppUser user, IFormFileCollection files, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadAsync(AppUser user, string id, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadArchiveAsync(AppUser user, string[] ids, CancellationToken cancellationToken);
    Task<IList<UserFile>> ListAsync(AppUser user, CancellationToken cancellationToken);
}
