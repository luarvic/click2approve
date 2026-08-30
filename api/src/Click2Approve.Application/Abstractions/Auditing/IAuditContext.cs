namespace Click2Approve.Application.Abstractions.Auditing;

/// <summary>
/// Provides audit behavior and actor information for the current operation.
/// </summary>
public interface IAuditContext
{
    /// <summary>
    /// Gets whether persistence should create audit log entries.
    /// </summary>
    bool IsEnabled { get; }

    /// <summary>
    /// Gets the optional user responsible for the current operation.
    /// </summary>
    long? UserId { get; }
}
