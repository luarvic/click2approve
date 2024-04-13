using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace click2approve.WebAPI.Models;

// Represents an EF database context.
public class ApiDbContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<UserFile> UserFiles { get; set; }
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; }
    public DbSet<ApprovalRequestTask> ApprovalRequestTasks { get; set; }
    public DbSet<AuditLogEntry> AuditLogEntries { get; set; }
}
