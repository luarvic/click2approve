using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for audit logs.
/// </summary>
public class AuditLogRepository(ApiDbContext db) : IAuditLogRepository
{
    private readonly ApiDbContext _db = db;

    public async Task<AuditLogEntry> AddAsync(AuditLogEntry auditLogEntry, CancellationToken cancellationToken)
    {
        var entry = await _db.AuditLogEntries.AddAsync(auditLogEntry, cancellationToken);
        return entry.Entity;
    }
}
