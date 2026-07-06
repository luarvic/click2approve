namespace Click2Approve.Application.Services.AuditLogs;

using Click2Approve.Domain.Models;

/// <summary>
/// Defines a contract for a service that manages the audit log.
/// </summary>
public interface IAuditLogService
{
    Task LogAsync(AppUser user, DateTime when, string what, string jsonData, CancellationToken cancellationToken);
}
