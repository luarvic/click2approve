using api.Models;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace api.Extentions;

public static class UserManagerExtentions
{
    public static async Task<AppUser> GetUserByPrincipal(this UserManager<AppUser> userManager, ClaimsPrincipal principal, CancellationToken cancellationToken)
    {
        var name = principal.Claims.ToList().First(c => c.Type == "name").Value;
        var user = await userManager.FindByNameAsync(name);
        return user ?? throw new Exception("Unable to get user by its claims.");
    }
}
