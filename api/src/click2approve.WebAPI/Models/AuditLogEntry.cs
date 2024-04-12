namespace click2approve.WebAPI.Models;

public class AuditLogEntry
{
    public long Id { get; set; }
    public required string Who { get; set; }
    public required DateTime When { get; set; }
    public required string What { get; set; }
    public required string Data { get; set; }
}
