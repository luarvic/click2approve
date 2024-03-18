namespace api.Services;

public interface IAuditLogService
{
    Task LogAsync(string who, DateTime when, string what, string jsonData, CancellationToken cancellationToken);
}
