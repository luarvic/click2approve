using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Represents an entity framework database context.
/// </summary>
public class ApiDbContext(DbContextOptions options) : IdentityDbContext<AppUser>(options), IUnitOfWork
{
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; }
    public DbSet<ApprovalRequestTask> ApprovalRequestTasks { get; set; }
    public DbSet<AuditLogEntry> AuditLogEntries { get; set; }
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<UserFile> UserFiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Tenant>()
            .Property(t => t.BusinessName)
            .HasMaxLength(255);

        modelBuilder.Entity<Tenant>()
            .Property(t => t.Email)
            .HasMaxLength(320);

        modelBuilder.Entity<Tenant>()
            .Property(t => t.Phone)
            .HasMaxLength(64);

        modelBuilder.Entity<Tenant>()
            .Property(t => t.WebsiteUrl)
            .HasMaxLength(2048);

        modelBuilder.Entity<Tenant>()
            .HasOne(t => t.Owner)
            .WithMany()
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.BusinessName);

        modelBuilder.Entity<AuditLogEntry>()
            .Property(e => e.Who)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequest>()
            .HasIndex(r => new { r.TenantId, r.Author, r.Submitted });

        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(r => r.Tenant)
            .WithMany(t => t.ApprovalRequests)
            .HasForeignKey(r => r.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasIndex(t => new { t.TenantId, t.Approver, t.Status });

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasOne(t => t.Tenant)
            .WithMany(t => t.ApprovalRequestTasks)
            .HasForeignKey(t => t.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AuditLogEntry>()
            .HasIndex(e => new { e.TenantId, e.Who, e.When });

        modelBuilder.Entity<AuditLogEntry>()
            .HasOne(e => e.Tenant)
            .WithMany(t => t.AuditLogEntries)
            .HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserFile>()
            .HasIndex(f => new { f.TenantId, f.OwnerId });

        modelBuilder.Entity<UserFile>()
            .HasOne(f => f.Owner)
            .WithMany()
            .HasForeignKey(f => f.OwnerId)
            .IsRequired();

        modelBuilder.Entity<UserFile>()
            .HasOne(f => f.Tenant)
            .WithMany(t => t.UserFiles)
            .HasForeignKey(f => f.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
