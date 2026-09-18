namespace Click2Approve.Infrastructure.Identity;

/// <summary>Stores a fixed email allowance window in an Identity user token.</summary>
internal sealed record AccountEmailRateLimitState(DateTimeOffset WindowStartedAt, int RequestCount);
