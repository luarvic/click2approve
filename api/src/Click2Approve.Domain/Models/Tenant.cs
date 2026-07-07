namespace Click2Approve.Domain.Models;

/// <summary>
/// Represents a business tenant.
/// </summary>
public class Tenant : DbEntity
{
    public required string BusinessName { get; set; }
    public required TenantType Type { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Logo { get; set; }
    public required AppUser Owner { get; set; }
    public List<UserFile> UserFiles { get; set; } = [];
    public List<ApprovalRequest> ApprovalRequests { get; set; } = [];
    public List<ApprovalRequestTask> ApprovalRequestTasks { get; set; } = [];
    public List<AuditLogEntry> AuditLogEntries { get; set; } = [];
}
