using api.Models;

namespace api.Services;

// An interface that defines a contract for a service that manages user files (uploads, gets, deletes, etc.).
public interface IFileService
{
    Task<IList<UserFile>> UploadFilesAsync(AppUser user, IFormFileCollection files, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> GetFileAsync(AppUser user, string id, bool preview, CancellationToken cancellationToken);
    Task<IList<UserFile>> GetUserFilesAsync(AppUser user, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> GetArchiveAsync(AppUser user, string[] ids, CancellationToken cancellationToken);
    Task<string> ShareUserFilesAsync(AppUser user, string[] ids, DateTime availableUntil, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> GetSharedArchiveAsync(string key, CancellationToken cancellationToken);
    Task<bool> TestSharedArchiveAsync(string key, CancellationToken cancellationToken);
}
