using System.Security.Claims;
using Click2Approve.Application.Abstractions.Auditing;

namespace Click2Approve.WebApi.Auditing;

/// <summary>
/// Enables audit logging and resolves the actor from the current HTTP request.
/// </summary>
public sealed class HttpAuditContext(IHttpContextAccessor httpContextAccessor) : IAuditContext
{
    /// <inheritdoc />
    public bool IsEnabled => true;

    /// <inheritdoc />
    public long? UserId
    {
        get
        {
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
}
