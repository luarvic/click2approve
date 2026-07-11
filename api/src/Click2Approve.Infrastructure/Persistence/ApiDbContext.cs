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
    public DbSet<ApprovalRequestStep> ApprovalRequestSteps { get; set; }
    public DbSet<ApprovalRequestStepApprover> ApprovalRequestStepApprovers { get; set; }
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
            .Property(t => t.Type)
            .HasConversion<int>();

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
            .Property(r => r.Status)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequest>()
            .Property(r => r.Title)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequest>()
            .Property(r => r.AuthorEmail)
            .HasMaxLength(320);

        modelBuilder.Entity<ApprovalRequest>()
            .HasIndex(r => new { r.TenantId, r.AuthorUserId, r.CreatedAt });

        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(r => r.AuthorUser)
            .WithMany()
            .HasForeignKey(r => r.AuthorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(r => r.Tenant)
            .WithMany(t => t.ApprovalRequests)
            .HasForeignKey(r => r.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalRequestStep>()
            .Property(s => s.Mode)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequestStep>()
            .HasIndex(s => new { s.ApprovalRequestId, s.Sequence })
            .IsUnique();

        modelBuilder.Entity<ApprovalRequestStep>()
            .HasOne(s => s.ApprovalRequest)
            .WithMany(r => r.Steps)
            .HasForeignKey(s => s.ApprovalRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalRequestStepApprover>()
            .Property(a => a.Type)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequestStepApprover>()
            .Property(a => a.Email)
            .HasMaxLength(320);

        modelBuilder.Entity<ApprovalRequestStepApprover>()
            .HasOne(a => a.ApprovalRequestStep)
            .WithMany(s => s.Approvers)
            .HasForeignKey(a => a.ApprovalRequestStepId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.Status)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.Title)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.ApproverEmail)
            .HasMaxLength(320);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasIndex(t => new { t.ApproverEmail, t.ApproverUserId });

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasIndex(t => new { t.TenantId, t.ApproverUserId, t.Status });

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasOne(t => t.ApproverUser)
            .WithMany()
            .HasForeignKey(t => t.ApproverUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasOne(t => t.ApprovalRequest)
            .WithMany(r => r.Tasks)
            .HasForeignKey(t => t.ApprovalRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasOne(t => t.ApprovalRequestStep)
            .WithMany(s => s.Tasks)
            .HasForeignKey(t => t.ApprovalRequestStepId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasOne(t => t.ApprovalRequestStepApprover)
            .WithMany(a => a.Tasks)
            .HasForeignKey(t => t.ApprovalRequestStepApproverId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasOne(t => t.Tenant)
            .WithMany(t => t.ApprovalRequestTasks)
            .HasForeignKey(t => t.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AuditLogEntry>()
            .HasIndex(e => new { e.TenantId, e.Who, e.OccurredAt });

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
