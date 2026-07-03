using Click2Approve.Application.Services.AuditLogService;
using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.AuditLogService;

/// <summary>
/// Adds an audit log entry.
/// </summary>
public class AuditLogService(IApiDbContext db) : IAuditLogService
{
    private readonly IApiDbContext _db = db;

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
