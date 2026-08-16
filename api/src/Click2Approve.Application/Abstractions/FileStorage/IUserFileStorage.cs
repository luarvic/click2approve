using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.FileStorage;

/// <summary>
/// Stores file content for persisted user-file records.
/// </summary>
public interface IUserFileStorage
{
    Task SaveAsync(UserFile userFile, byte[] bytes, CancellationToken cancellationToken);
    Task<byte[]> ReadAsync(UserFile userFile, CancellationToken cancellationToken);
    Task DeleteAsync(UserFile userFile, CancellationToken cancellationToken);
    string GetPublicUrl(UserFile userFile);
}
