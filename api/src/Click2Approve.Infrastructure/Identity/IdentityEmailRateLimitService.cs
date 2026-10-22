using System.Text.Json;
using Click2Approve.Application.Abstractions.Identity;
using Click2Approve.Application.Models.Results.Identity;
using Click2Approve.Application.Services.Identity;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Click2Approve.Infrastructure.Identity;

/// <summary>
/// Enforces independent, persistent per-account security email allowances.
/// </summary>
public sealed class IdentityEmailRateLimitService(
    ApiDbContext db,
    IOptionsMonitor<AccountEmailRateLimitOptions> options,
    TimeProvider timeProvider) : IIdentityEmailRateLimitService
{
    private const string Provider = "Click2Approve.AccountEmailLimits";
    private readonly ApiDbContext _db = db;
    private readonly IOptionsMonitor<AccountEmailRateLimitOptions> _options = options;
    private readonly TimeProvider _timeProvider = timeProvider;

    public async Task<IdentityEmailRateLimitResult> TryAcquireAsync(
        string normalizedEmail, AccountEmailPurpose purpose, CancellationToken cancellationToken)
    {
        var userId = await _db.Users.Where(user => user.NormalizedEmail == normalizedEmail)
            .Select(user => (long?)user.Id).SingleOrDefaultAsync(cancellationToken);
        if (userId is null) return IdentityEmailRateLimitResult.NotFound;

        var name = purpose.ToString();
        var policy = _options.Get(name);
        var tokens = _db.UserTokens.Where(token => token.UserId == userId.Value
            && token.LoginProvider == Provider && token.Name == name);
        for (var attempt = 0; attempt < 8; attempt++)
        {
            var expected = await tokens.AsNoTracking().Select(token => token.Value)
                .SingleOrDefaultAsync(cancellationToken);
            var now = _timeProvider.GetUtcNow();
            var state = expected is null ? null : JsonSerializer.Deserialize<AccountEmailRateLimitState>(expected);
            if (state is null || state.WindowStartedAt.AddMinutes(policy.EmailWindowMinutes) <= now)
                state = new AccountEmailRateLimitState(now, 0);
            if (state.RequestCount >= policy.EmailPermitLimit) return IdentityEmailRateLimitResult.RateLimited;
            var value = JsonSerializer.Serialize(state with { RequestCount = state.RequestCount + 1 });
            if (expected is not null)
            {
                if (await tokens.Where(token => token.Value == expected)
                    .ExecuteUpdateAsync(setters => setters.SetProperty(token => token.Value, value), cancellationToken) == 1)
                    return IdentityEmailRateLimitResult.Allowed;
                continue;
            }

            var token = new IdentityUserToken<long>
            {
                UserId = userId.Value,
                LoginProvider = Provider,
                Name = name,
                Value = value
            };
            _db.UserTokens.Add(token);
            try
            {
                await _db.SaveChangesAsync(cancellationToken);
                _db.Entry(token).State = EntityState.Detached;
                return IdentityEmailRateLimitResult.Allowed;
            }
            catch (DbUpdateException)
            {
                _db.Entry(token).State = EntityState.Detached;
                // Retry only when another request created the same allowance row.
                if (!await tokens.AnyAsync(cancellationToken)) throw;
            }
        }
        return IdentityEmailRateLimitResult.RateLimited;
    }
}
