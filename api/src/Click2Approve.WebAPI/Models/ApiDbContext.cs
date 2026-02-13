using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.WebAPI.Models;

/// <summary>
/// Represents an entity framework database context.
/// </summary>
public class ApiDbContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<UserFile> UserFiles { get; set; }
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; }
    public DbSet<ApprovalRequestTask> ApprovalRequestTasks { get; set; }
    public DbSet<AuditLogEntry> AuditLogEntries { get; set; }
}
