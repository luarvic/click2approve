using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity;

namespace Click2Approve.Infrastructure.Services.Identity;

/// <summary>
/// Allows registration to reuse an existing placeholder user with the same email.
/// </summary>
public class PlaceholderAwareUserValidator(IdentityErrorDescriber? errors = null) : UserValidator<AppUser>(errors)
{
    public override async Task<IdentityResult> ValidateAsync(UserManager<AppUser> manager, AppUser user)
    {
        var result = await base.ValidateAsync(manager, user);
        if (result.Succeeded)
        {
            return result;
        }

        var existing = string.IsNullOrWhiteSpace(user.Email)
            ? null
            : await manager.FindByEmailAsync(user.Email);
        if (existing?.IsPlaceholder != true)
        {
            return result;
        }

        var remainingErrors = result.Errors
            .Where(error => error.Code != nameof(IdentityErrorDescriber.DuplicateEmail)
                && error.Code != nameof(IdentityErrorDescriber.DuplicateUserName))
            .ToArray();
        return remainingErrors.Length == 0
            ? IdentityResult.Success
            : IdentityResult.Failed(remainingErrors);
    }
}
