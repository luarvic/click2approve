using api.Models;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace api.Extensions;

// Extends UserManager<AppUser> class.
public static class UserManagerExtensions
{
    public static async Task<AppUser> GetUserByPrincipalAsync(this UserManager<AppUser> userManager, ClaimsPrincipal principal, CancellationToken cancellationToken)
    {
        var name = principal.Claims.ToList().First(c => c.Type == "name").Value;
        var user = await userManager.FindByNameAsync(name);
        return user ?? throw new Exception("Unable to get user by its claims.");
    }
}
