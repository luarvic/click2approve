using Click2Approve.Application.Abstractions.Auditing;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Disables audit logging for system operations such as event workers.
/// </summary>
public sealed class DisabledAuditContext : IAuditContext
{
    /// <inheritdoc />
    public bool IsEnabled => false;

    /// <inheritdoc />
    public long? UserId => null;
}
