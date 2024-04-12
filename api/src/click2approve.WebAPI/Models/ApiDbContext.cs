using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace click2approve.WebAPI.Models;

// Represents an EF database context.
public class ApiDbContext(DbContextOptions options, IConfiguration configuration) : IdentityDbContext<AppUser>(options)
{
    private readonly IConfiguration _configuration = configuration;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        var connectionString = _configuration.GetConnectionString("Default");
        optionsBuilder.UseMySql(_configuration.GetConnectionString("Default"),
            ServerVersion.AutoDetect(connectionString));
    }

    public DbSet<UserFile> UserFiles { get; set; }
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; }
    public DbSet<ApprovalRequestTask> ApprovalRequestTasks { get; set; }
    public DbSet<AuditLogEntry> AuditLogEntries { get; set; }
}
