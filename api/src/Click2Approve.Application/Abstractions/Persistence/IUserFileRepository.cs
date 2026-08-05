using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Persistence;

/// <summary>
/// Defines persistence operations for user files.
/// </summary>
public interface IUserFileRepository
{
    Task<UserFile> AddAsync(UserFile userFile, CancellationToken cancellationToken);
    Task<UserFile?> GetForDownloadAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<UserFile?> GetForApprovalRequestDownloadAsync(AppUser user, Guid globalId, Guid approvalRequestGlobalId, CancellationToken cancellationToken);
    Task<UserFile?> GetForApprovalRequestTaskDownloadAsync(AppUser user, Guid globalId, Guid approvalRequestTaskGlobalId, CancellationToken cancellationToken);
    Task<UserFile?> GetForDeleteAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<IList<UserFile>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task<List<UserFile>> ListAsync(AppUser user, IReadOnlyCollection<Guid> globalIds, CancellationToken cancellationToken);
    Task<int> CountAsync(AppUser user, CancellationToken cancellationToken);
    void Remove(UserFile userFile);
}
