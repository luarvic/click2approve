using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Persistence;

/// <summary>
/// Defines persistence operations for user files.
/// </summary>
public interface IUserFileRepository
{
    Task<UserFile> AddAsync(UserFile userFile, CancellationToken cancellationToken);
    Task<UserFile> GetForDownloadAsync(AppUser user, long id, CancellationToken cancellationToken);
    Task<UserFile> GetForDeleteAsync(AppUser user, long id, CancellationToken cancellationToken);
    Task<IList<UserFile>> ListByOwnerAsync(AppUser user, CancellationToken cancellationToken);
    Task<List<UserFile>> ListByOwnerAndIdsAsync(AppUser user, IReadOnlyCollection<long> ids, CancellationToken cancellationToken);
    Task<int> CountByOwnerAsync(AppUser user, CancellationToken cancellationToken);
    void Remove(UserFile userFile);
}
