using Click2Approve.Domain.Models;
using Click2Approve.Domain.Validation;
using Microsoft.AspNetCore.Identity;

namespace Click2Approve.Infrastructure.Identity;

/// <summary>
/// Allows registration to reuse an existing placeholder user with the same email.
/// </summary>
public class PlaceholderAwareUserValidator(IdentityErrorDescriber? errors = null) : UserValidator<AppUser>(errors)
{
    public override async Task<IdentityResult> ValidateAsync(UserManager<AppUser> manager, AppUser user)
    {
        // Native Identity endpoints do not pass through the MVC request filter.
        var lengthErrors = new List<IdentityError>();
        if (user.Email?.Length > FieldLimits.Email)
            lengthErrors.Add(new IdentityError
            {
                Code = "EmailTooLong",
                Description = $"Email must not exceed {FieldLimits.Email} characters."
            });
        if (user.UserName?.Length > FieldLimits.IdentityUserName)
            lengthErrors.Add(new IdentityError
            {
                Code = "UserNameTooLong",
                Description = $"User name must not exceed {FieldLimits.IdentityUserName} characters."
            });
        if (lengthErrors.Count > 0) return IdentityResult.Failed([.. lengthErrors]);

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
