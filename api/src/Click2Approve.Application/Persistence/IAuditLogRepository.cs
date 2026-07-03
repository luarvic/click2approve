using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Persistence;

/// <summary>
/// Defines persistence operations for audit logs.
/// </summary>
public interface IAuditLogRepository
{
    Task<AuditLogEntry> AddAsync(AuditLogEntry auditLogEntry, CancellationToken cancellationToken);
}
