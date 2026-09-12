namespace Click2Approve.Application.Models.Results.Identity;

/// <summary>
/// Describes the result of acquiring an identity email rate-limit permit.
/// </summary>
public enum IdentityEmailRateLimitResult
{
    Allowed,
    NotFound,
    RateLimited
}
