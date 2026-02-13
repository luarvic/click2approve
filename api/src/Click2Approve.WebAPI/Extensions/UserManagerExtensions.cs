using Click2Approve.WebAPI.Models;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace Click2Approve.WebAPI.Extensions;

/// <summary>
/// Extends UserManager class.
/// </summary>
public static class UserManagerExtensions
{
    /// <summary>
    /// Returns AppUser object out of principal claims.
    /// </summary>
    public static async Task<AppUser> GetUserByPrincipalAsync(this UserManager<AppUser> userManager, ClaimsPrincipal principal, CancellationToken cancellationToken)
    {
        var identity = principal.Identity ?? throw new Exception("Unable to get user identity.");
        var username = identity.Name ?? throw new Exception("Unable to get username.");
        return await userManager.FindByNameAsync(username) ?? throw new Exception("Unable to get user by its name.");
    }
}
