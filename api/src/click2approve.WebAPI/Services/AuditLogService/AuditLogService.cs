
using click2approve.WebAPI.Models;

namespace click2approve.WebAPI.Services;

/// <summary>
/// Adds an audit log entry.
/// </summary>
public class AuditLogService(ApiDbContext db) : IAuditLogService
{
    private readonly ApiDbContext _db = db;

    public async Task LogAsync(string who, DateTime when, string what, string jsonData, CancellationToken cancellationToken)
    {
        await _db.AuditLogEntries.AddAsync(new AuditLogEntry
        {
            Who = who,
            When = when,
            What = what,
            Data = jsonData
        }, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
