namespace Click2Approve.Application.Models.Authorization;

/// <summary>
/// Identifies the authenticated user and tenant for an authorization check.
/// </summary>
public record AccessScope(long TenantId, long UserId);
