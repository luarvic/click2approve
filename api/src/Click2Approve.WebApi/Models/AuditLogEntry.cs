namespace Click2Approve.WebApi.Models;

/// <summary>
/// Represents an audit log entry.
/// </summary>
public class AuditLogEntry : DbEntity
{
    public required string Who { get; set; }
    public required DateTime When { get; set; }
    public required string What { get; set; }
    public required string Data { get; set; }
}
