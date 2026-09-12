using Click2Approve.Application.Abstractions.Identity;
using Click2Approve.Application.Models.Results.Identity;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Identity;

/// <summary>
/// Enforces identity email rate limits through persisted user data.
/// </summary>
public class IdentityEmailRateLimitService(
    ApiDbContext db,
    int permitLimit,
    TimeSpan window) : IIdentityEmailRateLimitService
{
    private readonly ApiDbContext _db = db;
    private readonly int _permitLimit = permitLimit;
    private readonly TimeSpan _window = window;

    /// <inheritdoc />
    public async Task<IdentityEmailRateLimitResult> TryAcquireAsync(string normalizedEmail, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var windowStartCutoff = now - _window;
        var updated = await _db.Users
            .Where(user => user.NormalizedEmail == normalizedEmail)
            .Where(user => user.AccountEmailRateLimitWindowStartedAt == null
                || user.AccountEmailRateLimitWindowStartedAt <= windowStartCutoff
                || user.AccountEmailRateLimitRequestCount < _permitLimit)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(
                        user => user.AccountEmailRateLimitRequestCount,
                        user => user.AccountEmailRateLimitWindowStartedAt == null
                            || user.AccountEmailRateLimitWindowStartedAt <= windowStartCutoff
                            ? 1
                            : user.AccountEmailRateLimitRequestCount + 1)
                    .SetProperty(
                        user => user.AccountEmailRateLimitWindowStartedAt,
                        user => user.AccountEmailRateLimitWindowStartedAt == null
                            || user.AccountEmailRateLimitWindowStartedAt <= windowStartCutoff
                            ? now
                            : user.AccountEmailRateLimitWindowStartedAt),
                cancellationToken);

        if (updated > 0)
        {
            return IdentityEmailRateLimitResult.Allowed;
        }

        var userExists = await _db.Users.AnyAsync(user => user.NormalizedEmail == normalizedEmail, cancellationToken);
        return userExists ? IdentityEmailRateLimitResult.RateLimited : IdentityEmailRateLimitResult.NotFound;
    }
}
