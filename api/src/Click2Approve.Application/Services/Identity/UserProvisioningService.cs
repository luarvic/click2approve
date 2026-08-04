using Click2Approve.Application.Helpers;
using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity;

namespace Click2Approve.Application.Services.Identity;

/// <summary>
/// Provisions Identity users for addresses that can be assigned before registration.
/// </summary>
public class UserProvisioningService(UserManager<AppUser> userManager) : IUserProvisioningService
{
    private readonly UserManager<AppUser> _userManager = userManager;

    public async Task<AppUser> EnsureUserAsync(string email, CancellationToken cancellationToken)
    {
        var normalizedEmail = EmailHelpers.NormalizeIdentityEmailKey(email);
        var user = await _userManager.FindByEmailAsync(normalizedEmail);
        if (user is not null)
        {
            return user;
        }

        user = new AppUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            IsPlaceholder = true
        };

        var result = await _userManager.CreateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join(" ", result.Errors.Select(error => error.Description)));
        }

        return user;
    }
}
