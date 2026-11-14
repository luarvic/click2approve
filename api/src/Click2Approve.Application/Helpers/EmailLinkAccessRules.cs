using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Helpers;

/// <summary>Preserves existing invitation access until registration establishes verified account ownership.</summary>
public static class EmailLinkAccessRules
{
    /// <summary>Allows placeholders and registrations still awaiting required email confirmation to use an existing link.</summary>
    public static bool CanUseExistingLink(AppUser user, bool emailConfirmationRequired) =>
        user.IsPlaceholder || (emailConfirmationRequired && !user.EmailConfirmed);
}
