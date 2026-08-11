using Click2Approve.Application.Abstractions.Identity;
using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Identity;

/// <summary>
/// Provides user lookups through the Identity store.
/// </summary>
public class UserLookupService(UserManager<AppUser> userManager) : IUserLookupService
{
    private readonly UserManager<AppUser> _userManager = userManager;

    public Task<List<AppUser>> ListAsync(IReadOnlyCollection<Guid> globalIds, CancellationToken cancellationToken)
    {
        return _userManager.Users
            .Where(user => globalIds.Contains(user.GlobalId))
            .ToListAsync(cancellationToken);
    }
}
