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
    public DbSet<ApprovalRequestLogEntry> ApprovalRequestLogEntries { get; set; }
    public DbSet<ApprovalRequestStep> ApprovalRequestSteps { get; set; }
    public DbSet<ApprovalRequestStepApprover> ApprovalRequestStepApprovers { get; set; }
    public DbSet<ApprovalRequestTask> ApprovalRequestTasks { get; set; }
    public DbSet<ApprovalRequestTaskLogEntry> ApprovalRequestTaskLogEntries { get; set; }
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<UserFile> UserFiles { get; set; }
    public DbSet<UserNotificationPreference> UserNotificationPreferences { get; set; }

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

        modelBuilder.Entity<AppUser>()
            .Property(u => u.FirstName)
            .HasMaxLength(255);

        modelBuilder.Entity<AppUser>()
            .Property(u => u.LastName)
            .HasMaxLength(255);

        modelBuilder.Entity<AppUser>()
            .HasOne<Tenant>()
            .WithMany()
            .HasForeignKey(u => u.DefaultTenantId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.BusinessName);

        modelBuilder.Entity<ApprovalRequest>()
            .Property(r => r.Status)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequest>()
            .Property(r => r.Title)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequest>()
            .Property(r => r.CreatedByEmail)
            .HasMaxLength(320);

        modelBuilder.Entity<ApprovalRequest>()
            .Property(r => r.CreatedByDisplayName)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequest>()
            .HasIndex(r => new { r.TenantId, r.CreatedByUserId, r.CreatedAt });

        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(r => r.CreatedByUser)
            .WithMany()
            .HasForeignKey(r => r.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(r => r.Tenant)
            .WithMany(t => t.ApprovalRequests)
            .HasForeignKey(r => r.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalRequestLogEntry>()
            .Property(e => e.ActorType)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequestLogEntry>()
            .Property(e => e.EventType)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequestLogEntry>()
            .Property(e => e.ActorEmail)
            .HasMaxLength(320);

        modelBuilder.Entity<ApprovalRequestLogEntry>()
            .Property(e => e.ActorDisplayName)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequestLogEntry>()
            .HasIndex(e => new { e.ApprovalRequestId, e.Timestamp });

        modelBuilder.Entity<ApprovalRequestLogEntry>()
            .HasOne(e => e.ApprovalRequest)
            .WithMany(r => r.LogEntries)
            .HasForeignKey(e => e.ApprovalRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalRequestLogEntry>()
            .HasOne(e => e.ActorUser)
            .WithMany()
            .HasForeignKey(e => e.ActorUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ApprovalRequestLogEntry>()
            .HasOne(e => e.Tenant)
            .WithMany(t => t.ApprovalRequestLogEntries)
            .HasForeignKey(e => e.TenantId)
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
            .Property(a => a.ApproverDisplayName)
            .HasMaxLength(255);

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
            .Property(t => t.ApproverDisplayName)
            .HasMaxLength(255);

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

        modelBuilder.Entity<ApprovalRequestTaskLogEntry>()
            .Property(e => e.ActorType)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequestTaskLogEntry>()
            .Property(e => e.EventType)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequestTaskLogEntry>()
            .Property(e => e.ActorEmail)
            .HasMaxLength(320);

        modelBuilder.Entity<ApprovalRequestTaskLogEntry>()
            .Property(e => e.ActorDisplayName)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequestTaskLogEntry>()
            .Property(e => e.OnBehalfOfActorType)
            .HasConversion<int?>();

        modelBuilder.Entity<ApprovalRequestTaskLogEntry>()
            .Property(e => e.OnBehalfOfEmail)
            .HasMaxLength(320);

        modelBuilder.Entity<ApprovalRequestTaskLogEntry>()
            .Property(e => e.OnBehalfOfDisplayName)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequestTaskLogEntry>()
            .HasIndex(e => new { e.ApprovalRequestTaskId, e.Timestamp });

        modelBuilder.Entity<ApprovalRequestTaskLogEntry>()
            .HasOne(e => e.ApprovalRequestTask)
            .WithMany(t => t.LogEntries)
            .HasForeignKey(e => e.ApprovalRequestTaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalRequestTaskLogEntry>()
            .HasOne(e => e.ActorUser)
            .WithMany()
            .HasForeignKey(e => e.ActorUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ApprovalRequestTaskLogEntry>()
            .HasOne(e => e.Tenant)
            .WithMany(t => t.ApprovalRequestTaskLogEntries)
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

        modelBuilder.Entity<UserNotificationPreference>()
            .Property(preference => preference.Type)
            .HasConversion<int>();

        modelBuilder.Entity<UserNotificationPreference>()
            .Property(preference => preference.Channel)
            .HasConversion<int>();

        modelBuilder.Entity<UserNotificationPreference>()
            .HasOne(preference => preference.User)
            .WithMany(user => user.NotificationPreferences)
            .HasForeignKey(preference => preference.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserNotificationPreference>()
            .HasIndex(preference => new { preference.UserId, preference.Type, preference.Channel })
            .IsUnique();
    }
}
