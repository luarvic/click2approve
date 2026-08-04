using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Services.Identity;

/// <summary>
/// Converts placeholder Identity rows into registered users when stock registration creates the same email.
/// </summary>
public class PlaceholderAwareUserStore(ApiDbContext context, IdentityErrorDescriber? describer = null)
    : UserStore<AppUser, IdentityRole, ApiDbContext, string>(context, describer)
{
    public override async Task<IdentityResult> CreateAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        ArgumentNullException.ThrowIfNull(user);

        if (!string.IsNullOrWhiteSpace(user.NormalizedEmail))
        {
            var placeholder = await Context.Users
                .FirstOrDefaultAsync(existing => existing.NormalizedEmail == user.NormalizedEmail
                    && existing.IsPlaceholder,
                    cancellationToken);
            if (placeholder is not null)
            {
                ActivatePlaceholder(placeholder, user);
                await Context.SaveChangesAsync(cancellationToken);
                CopyIdentity(placeholder, user);
                return IdentityResult.Success;
            }
        }

        return await base.CreateAsync(user, cancellationToken);
    }

    private static void ActivatePlaceholder(AppUser placeholder, AppUser user)
    {
        placeholder.UserName = user.UserName;
        placeholder.NormalizedUserName = user.NormalizedUserName;
        placeholder.Email = user.Email;
        placeholder.NormalizedEmail = user.NormalizedEmail;
        placeholder.EmailConfirmed = user.EmailConfirmed;
        placeholder.PasswordHash = user.PasswordHash;
        placeholder.SecurityStamp = user.SecurityStamp;
        placeholder.ConcurrencyStamp = user.ConcurrencyStamp;
        placeholder.PhoneNumber = user.PhoneNumber;
        placeholder.PhoneNumberConfirmed = user.PhoneNumberConfirmed;
        placeholder.TwoFactorEnabled = user.TwoFactorEnabled;
        placeholder.LockoutEnd = user.LockoutEnd;
        placeholder.LockoutEnabled = user.LockoutEnabled;
        placeholder.AccessFailedCount = user.AccessFailedCount;
        placeholder.IsPlaceholder = false;
    }

    private static void CopyIdentity(AppUser source, AppUser target)
    {
        target.Id = source.Id;
        target.SecurityStamp = source.SecurityStamp;
        target.ConcurrencyStamp = source.ConcurrencyStamp;
        target.IsPlaceholder = source.IsPlaceholder;
    }
}
