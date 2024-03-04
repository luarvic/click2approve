using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace api.Models;

// Represents an EF database contexts.
public class FileManagerDbContext(DbContextOptions options, IConfiguration configuration) : IdentityDbContext<AppUser>(options)
{
    private readonly IConfiguration _configuration = configuration;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.UseSqlServer(_configuration.GetConnectionString("FileManager"));
    }

    public DbSet<UserFile> UserFiles { get; set; }
    public DbSet<UserFileForApproval> UserFilesForApproval { get; set; }
}
