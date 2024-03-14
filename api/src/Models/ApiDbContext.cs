using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace api.Models;

// Represents an EF database context.
public class ApiDbContext(DbContextOptions options, IConfiguration configuration) : IdentityDbContext<AppUser>(options)
{
    private readonly IConfiguration _configuration = configuration;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.UseSqlServer(_configuration.GetConnectionString("Default"));
    }

    public DbSet<UserFile> UserFiles { get; set; }
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; }
    public DbSet<Approver> Approvers { get; set; }
    public DbSet<ApprovalRequestLog> ApprovalRequestLogs { get; set; }
}
