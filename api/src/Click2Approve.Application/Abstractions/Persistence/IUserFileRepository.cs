using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Persistence;

/// <summary>
/// Defines persistence operations for user files.
/// </summary>
public interface IUserFileRepository
{
    Task<UserFile> AddAsync(UserFile userFile, CancellationToken cancellationToken);
    Task<UserFile?> GetPublicAsync(long id, CancellationToken cancellationToken);
    Task<UserFile?> GetTemporaryOwnedAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<UserFile?> GetForDownloadAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<UserFile?> GetApprovalRequestAttachmentForDownloadAsync(AppUser user, Guid globalId, Guid approvalRequestGlobalId, CancellationToken cancellationToken);
    Task<UserFile?> GetApprovalRequestAttachmentForTaskDownloadAsync(
        AppUser user,
        Guid globalId,
        Guid approvalRequestTaskGlobalId,
        CancellationToken cancellationToken);
    Task<UserFile?> GetApprovalRequestTaskAttachmentForDownloadAsync(
        AppUser user,
        Guid globalId,
        Guid approvalRequestTaskGlobalId,
        CancellationToken cancellationToken);
    Task<UserFile?> GetDiscussionMessageAttachmentForDownloadAsync(
        AppUser user,
        Guid globalId,
        Guid discussionMessageGlobalId,
        CancellationToken cancellationToken);
    Task<UserFile?> GetForDeleteAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<IList<UserFile>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task<List<UserFile>> ListAsync(AppUser user, IReadOnlyCollection<Guid> globalIds, CancellationToken cancellationToken);
    Task<int> CountAsync(AppUser user, CancellationToken cancellationToken);
    void Remove(UserFile userFile);
}
