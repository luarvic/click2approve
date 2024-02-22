using api.Models;

namespace api.Services;

// Defines a contract for user files management logic (uploads, gets, deletes, etc.).
public interface IFileService
{
    Task<IList<UserFile>> UploadFilesAsync(AppUser user, IFormFileCollection files, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> GetFileAsync(AppUser user, string id, CancellationToken cancellationToken);
    Task<IList<UserFile>> GetUserFilesAsync(AppUser user, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> GetArchiveAsync(AppUser user, string[] ids, CancellationToken cancellationToken);
    Task<string> ShareUserFilesAsync(AppUser user, string[] ids, DateTime availableUntil, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> GetSharedArchiveAsync(string key, CancellationToken cancellationToken);
    Task<bool> TestSharedAsync(string key, CancellationToken cancellationToken);
}
