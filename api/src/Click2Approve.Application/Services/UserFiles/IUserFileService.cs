using Click2Approve.Domain.Models;
using Click2Approve.Application.Models.DTOs;

namespace Click2Approve.Application.Services.UserFiles;

/// <summary>
/// Defines a contract for a service that manages user files.
/// </summary>
public interface IUserFileService
{
    Task<IList<UserFileDto>> UploadAsync(AppUser user, IFormFileCollection files, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadApprovalRequestFileAsync(AppUser user, Guid globalId, Guid approvalRequestGlobalId, CancellationToken cancellationToken);
    Task<(string Filename, byte[] Bytes)> DownloadApprovalRequestTaskFileAsync(AppUser user, Guid globalId, Guid approvalRequestTaskGlobalId, CancellationToken cancellationToken);
    Task<IList<UserFileDto>> ListAsync(AppUser user, CancellationToken cancellationToken);
    Task DeleteAsync(AppUser user, Guid globalId, CancellationToken cancellationToken);
}
