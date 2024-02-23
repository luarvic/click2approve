using api.Models;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace api.Extensions;

// Extends UserManager<AppUser> class.
public static class UserManagerExtensions
{
    public static async Task<AppUser> GetUserByPrincipalAsync(this UserManager<AppUser> userManager, ClaimsPrincipal principal, CancellationToken cancellationToken)
    {
        var identity = principal.Identity ?? throw new Exception("Unable to get user identity.");
        var username = identity.Name ?? throw new Exception("Unable to get username.");
        return await userManager.FindByNameAsync(username) ?? throw new Exception("Unable to get user by its name.");
    }
}
