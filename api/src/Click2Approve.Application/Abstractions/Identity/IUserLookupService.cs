using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Identity;

/// <summary>
/// Defines lookup operations for users referenced by public global IDs.
/// </summary>
public interface IUserLookupService
{
    Task<List<AppUser>> ListAsync(IReadOnlyCollection<Guid> globalIds, CancellationToken cancellationToken);
}
