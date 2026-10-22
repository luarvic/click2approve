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
    public long? UserId => httpContextAccessor.HttpContext?.Items[typeof(HttpAuditContext)] as long?;
}
