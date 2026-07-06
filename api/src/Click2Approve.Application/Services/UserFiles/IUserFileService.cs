using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Http;

namespace Click2Approve.Application.Services.UserFiles;

/// <summary>
/// Defines a contract for a service that manages user files.
/// </summary>
public interface IUserFileService
{
    Task<IList<UserFile>> UploadAsync(AppUser user, IFormFileCollection files, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadAsync(AppUser user, long id, CancellationToken cancellationToken);
    Task<IList<UserFile>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task DeleteAsync(AppUser user, long id, CancellationToken cancellationToken);
}
