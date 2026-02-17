using System.Security.Claims;
using Click2Approve.WebApi.Models;
using Microsoft.AspNetCore.Identity;

namespace Click2Approve.WebApi.Extensions;

/// <summary>
/// Extends UserManager class.
/// </summary>
public static class UserManagerExtensions
{
    public static async Task<AppUser> GetAppUserAsync(this UserManager<AppUser> userManager, ClaimsPrincipal principal)
    {
        var user = await userManager.GetUserAsync(principal);
        return user ?? throw new UnauthorizedAccessException("User not found.");
    }
}
