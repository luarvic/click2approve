namespace Click2Approve.WebApi.Services.AuditLogService;

/// <summary>
/// Defines a contract for a service that manages the audit log.
/// </summary>
public interface IAuditLogService
{
    Task LogAsync(string who, DateTime when, string what, string jsonData, CancellationToken cancellationToken);
}
