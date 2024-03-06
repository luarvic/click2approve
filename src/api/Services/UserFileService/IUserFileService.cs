using api.Models;

namespace api.Services;

// Defines a contract for user files management logic (uploads, gets, deletes, etc.).
public interface IUserFileService
{
    Task<IList<UserFile>> UploadAsync(AppUser user, IFormFileCollection files, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadAsync(AppUser user, string id, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadArchiveAsync(AppUser user, string[] ids, CancellationToken cancellationToken);
    Task<IList<UserFile>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task<string> SendAsync(AppUser user, string[] ids, string[] approvers, DateTime approveBy, string? comment, CancellationToken cancellationToken);
}
