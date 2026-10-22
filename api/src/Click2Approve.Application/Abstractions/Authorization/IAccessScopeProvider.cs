using Click2Approve.Application.Models.Authorization;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Authorization;

/// <summary>
/// Resolves the validated access scope for the current request.
/// </summary>
public interface IAccessScopeProvider
{
    Task<AccessScope> GetAsync(AppUser user, CancellationToken cancellationToken);
}
