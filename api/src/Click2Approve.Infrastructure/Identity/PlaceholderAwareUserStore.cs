using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Identity;

/// <summary>
/// Uses global user identifiers for Identity and activates existing placeholder users during registration.
/// </summary>
public class PlaceholderAwareUserStore(ApiDbContext context, IdentityErrorDescriber? describer = null)
    : UserStore<AppUser, IdentityRole<long>, ApiDbContext, long>(context, describer)
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

    /// <inheritdoc />
    public override Task<string> GetUserIdAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        ThrowIfDisposed();
        ArgumentNullException.ThrowIfNull(user);
        return Task.FromResult(user.GlobalId.ToString());
    }

    /// <inheritdoc />
    public override Task<AppUser?> FindByIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        ThrowIfDisposed();
        return Guid.TryParse(userId, out var globalId) && globalId != Guid.Empty
            ? Users.SingleOrDefaultAsync(user => user.GlobalId == globalId, cancellationToken)
            : Task.FromResult<AppUser?>(null);
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
        target.GlobalId = source.GlobalId;
        target.SecurityStamp = source.SecurityStamp;
        target.ConcurrencyStamp = source.ConcurrencyStamp;
        target.IsPlaceholder = source.IsPlaceholder;
    }
}
