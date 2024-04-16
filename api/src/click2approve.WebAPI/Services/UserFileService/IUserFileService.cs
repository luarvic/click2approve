using click2approve.WebAPI.Models;

namespace click2approve.WebAPI.Services;

// Defines a contract for a service that manages user files.
public interface IUserFileService
{
    Task<IList<UserFile>> UploadAsync(AppUser user, IFormFileCollection files, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadAsync(AppUser user, long id, CancellationToken cancellationToken);
    Task<IList<UserFile>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task DeleteAsync(AppUser user, long id, CancellationToken cancellationToken);
}
