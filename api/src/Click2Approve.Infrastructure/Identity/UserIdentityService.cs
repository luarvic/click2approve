using Click2Approve.Application.Abstractions.Identity;
using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Identity;

/// <summary>
/// Implements identity user operations through ASP.NET Core Identity.
/// </summary>
public class UserIdentityService(UserManager<AppUser> userManager) : IUserIdentityService
{
    private readonly UserManager<AppUser> _userManager = userManager;

    public async Task<AppUser?> FindAsync(Guid globalId, CancellationToken cancellationToken)
    {
        return await _userManager.Users.FirstOrDefaultAsync(user => user.GlobalId == globalId, cancellationToken);
    }

    public async Task UpdateAsync(AppUser user, CancellationToken cancellationToken)
    {
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException("Failed to update the user profile.");
        }
    }
}
