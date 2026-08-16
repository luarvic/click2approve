using Click2Approve.Application.Models.Files;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.UserFiles;

/// <summary>
/// Defines a contract for a service that manages user files.
/// </summary>
public interface IUserFileService
{
    Task<IList<UserFileResult>> UploadTemporaryAsync(AppUser user, IReadOnlyCollection<UploadedFile> files, CancellationToken cancellationToken);
    Task PromoteToPrivateAsync(IReadOnlyCollection<UserFile> userFiles, CancellationToken cancellationToken);
    Task PromoteToPublicAsync(IReadOnlyCollection<UserFile> userFiles, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadApprovalRequestAttachmentAsync(AppUser user, Guid globalId, Guid approvalRequestGlobalId, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadApprovalRequestAttachmentForTaskAsync(
        AppUser user,
        Guid globalId,
        Guid approvalRequestTaskGlobalId,
        CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadApprovalRequestTaskAttachmentAsync(
        AppUser user,
        Guid globalId,
        Guid approvalRequestTaskGlobalId,
        CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadDiscussionMessageAttachmentAsync(
        AppUser user,
        Guid globalId,
        Guid discussionMessageGlobalId,
        CancellationToken cancellationToken);
    Task<IList<UserFileResult>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task DeleteAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
}
