using Click2Approve.Application.Models.Results.Identity;

namespace Click2Approve.Application.Abstractions.Identity;

/// <summary>
/// Enforces rate limits for anonymous identity email requests.
/// </summary>
public interface IIdentityEmailRateLimitService
{
    Task<IdentityEmailRateLimitResult> TryAcquireAsync(string normalizedEmail, CancellationToken cancellationToken);
}
