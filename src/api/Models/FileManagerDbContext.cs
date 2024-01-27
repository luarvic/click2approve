using Microsoft.EntityFrameworkCore;

namespace api.Models;

public class FileManagerDbContext : DbContext
{
    private readonly IConfiguration _configuration;

    public FileManagerDbContext(DbContextOptions options, IConfiguration configuration) : base(options)
    {
        _configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.UseSqlServer(_configuration.GetConnectionString("FileManager"));
    }

    public DbSet<UserFile> UserFiles { get; set; }
}
