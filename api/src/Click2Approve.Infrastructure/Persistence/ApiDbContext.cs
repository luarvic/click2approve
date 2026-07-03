using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Represents an entity framework database context.
/// </summary>
public class ApiDbContext(DbContextOptions options) : IdentityDbContext<AppUser>(options), IApiDbContext
{
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; }
    public DbSet<ApprovalRequestTask> ApprovalRequestTasks { get; set; }
    public DbSet<AuditLogEntry> AuditLogEntries { get; set; }
    public DbSet<UserFile> UserFiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApprovalRequest>()
            .HasIndex(r => r.Author);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasIndex(t => new { t.Approver, t.Status });
    }
}
