using System.Security.Claims;
using System.Text.Json;
using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Domain.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Represents an entity framework database context.
/// </summary>
public class ApiDbContext(DbContextOptions options, IHttpContextAccessor httpContextAccessor) : IdentityDbContext<AppUser>(options), IUnitOfWork
{
    private static readonly JsonSerializerOptions AuditJsonOptions = new(JsonSerializerDefaults.Web);

    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; }
    public DbSet<ApprovalRequestFile> ApprovalRequestFiles { get; set; }
    public DbSet<ApprovalRequestStep> ApprovalRequestSteps { get; set; }
    public DbSet<ApprovalRequestStepAssignee> ApprovalRequestStepAssignees { get; set; }
    public DbSet<ApprovalRequestStepVisibility> ApprovalRequestStepVisibilities { get; set; }
    public DbSet<ApprovalRequestTask> ApprovalRequestTasks { get; set; }
    public DbSet<DomainEvent> DomainEvents { get; set; }
    public DbSet<EventDelivery> EventDeliveries { get; set; }
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<UserFile> UserFiles { get; set; }
    public DbSet<UserNotificationPreference> UserNotificationPreferences { get; set; }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);

        configurationBuilder
            .Properties<DateTime>()
            .HaveConversion<UtcDateTimeConverter>();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        ConfigureGlobalIdIndexes(modelBuilder);

        modelBuilder.Entity<AuditLog>()
            .Property(log => log.UserId)
            .HasMaxLength(450);

        modelBuilder.Entity<AuditLog>()
            .Property(log => log.EntityType)
            .HasMaxLength(255);

        modelBuilder.Entity<AuditLog>()
            .Property(log => log.EntityState)
            .HasMaxLength(32);

        modelBuilder.Entity<AuditLog>()
            .HasIndex(log => log.Timestamp);

        modelBuilder.Entity<AuditLog>()
            .HasIndex(log => new { log.EntityType, log.EntityId });

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
            .HasIndex(u => u.IsPlaceholder);

        modelBuilder.Entity<AppUser>()
            .HasIndex(u => u.GlobalId)
            .IsUnique();

        modelBuilder.Entity<AppUser>()
            .HasOne<Tenant>()
            .WithMany()
            .HasForeignKey(u => u.DefaultTenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.BusinessName);

        modelBuilder.Entity<ApprovalRequest>()
            .Property(r => r.Status)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequest>()
            .HasIndex(r => new { r.TenantId, r.Status, r.Result });

        modelBuilder.Entity<ApprovalRequest>()
            .Property(r => r.RevisionNumber)
            .HasDefaultValue(1);

        modelBuilder.Entity<ApprovalRequest>()
            .Property(r => r.Title)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequest>()
            .Property(r => r.CreatedByDisplayName)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequest>()
            .Property(r => r.CompletedByDisplayName)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequest>()
            .Property(r => r.OrganizationDisplayName)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequest>()
            .HasIndex(r => new { r.TenantId, r.CreatedByUserId, r.CreatedAt });

        modelBuilder.Entity<ApprovalRequest>()
            .HasIndex(r => r.PreviousRevisionApprovalRequestId)
            .IsUnique();

        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(r => r.CreatedByUser)
            .WithMany()
            .HasForeignKey(r => r.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(r => r.CompletedByUser)
            .WithMany()
            .HasForeignKey(r => r.CompletedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(r => r.Tenant)
            .WithMany(t => t.ApprovalRequests)
            .HasForeignKey(r => r.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequest>()
            .HasOne(r => r.PreviousRevisionApprovalRequest)
            .WithOne(r => r.NextRevisionApprovalRequest)
            .HasForeignKey<ApprovalRequest>(r => r.PreviousRevisionApprovalRequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestFile>()
            .Property(file => file.RevisionAction)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequestFile>()
            .HasIndex(file => new { file.ApprovalRequestId, file.Sequence });

        modelBuilder.Entity<ApprovalRequestFile>()
            .HasOne(file => file.ApprovalRequest)
            .WithMany(request => request.RequestFiles)
            .HasForeignKey(file => file.ApprovalRequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestFile>()
            .HasOne(file => file.UserFile)
            .WithMany(userFile => userFile.ApprovalRequestFiles)
            .HasForeignKey(file => file.UserFileId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestFile>()
            .HasOne(file => file.PreviousApprovalRequestFile)
            .WithMany()
            .HasForeignKey(file => file.PreviousApprovalRequestFileId)
            .OnDelete(DeleteBehavior.Restrict);

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
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestStep>()
            .Property(s => s.Action)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequestStepAssignee>()
            .Property(a => a.Type)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequestStepAssignee>()
            .Property(a => a.AssigneeDisplayName)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequestStepAssignee>()
            .HasOne(a => a.ApprovalRequestStep)
            .WithMany(s => s.Assignees)
            .HasForeignKey(a => a.ApprovalRequestStepId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestStepAssignee>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestStepVisibility>()
            .HasIndex(visibility => new { visibility.ApprovalRequestStepId, visibility.ApprovalRequestStepAssigneeId })
            .IsUnique();

        modelBuilder.Entity<ApprovalRequestStepVisibility>()
            .HasOne(visibility => visibility.ApprovalRequestStep)
            .WithMany(step => step.StepVisibilities)
            .HasForeignKey(visibility => visibility.ApprovalRequestStepId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestStepVisibility>()
            .HasOne(visibility => visibility.ApprovalRequestStepAssignee)
            .WithMany(assignee => assignee.StepVisibilities)
            .HasForeignKey(visibility => visibility.ApprovalRequestStepAssigneeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.Status)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequestTask>()
            .Ignore(task => task.TaskFiles);

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.Action)
            .HasConversion<int>();

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.RevisionNumber)
            .HasDefaultValue(1);

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.Title)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.AssigneeDisplayName)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.CompletedByDisplayName)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.OrganizationDisplayName)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.AssigneeIpAddress)
            .HasMaxLength(128);

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.AssigneeBrowserData)
            .HasMaxLength(1024);

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.AssigneeLegalName)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(t => t.AssigneeOrganization)
            .HasMaxLength(255);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasIndex(t => new { t.TenantId, t.AssigneeUserId, t.Status });

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasOne(t => t.AssigneeUser)
            .WithMany()
            .HasForeignKey(t => t.AssigneeUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasOne(task => task.CompletedByUser)
            .WithMany()
            .HasForeignKey(task => task.CompletedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasOne(t => t.ApprovalRequest)
            .WithMany()
            .HasForeignKey(t => t.ApprovalRequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasOne(t => t.ApprovalRequestStep)
            .WithMany(s => s.Tasks)
            .HasForeignKey(t => t.ApprovalRequestStepId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasOne(t => t.ApprovalRequestStepAssignee)
            .WithMany(a => a.Tasks)
            .HasForeignKey(t => t.ApprovalRequestStepAssigneeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApprovalRequestTask>()
            .HasOne(t => t.Tenant)
            .WithMany(t => t.ApprovalRequestTasks)
            .HasForeignKey(t => t.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserFile>()
            .HasIndex(f => new { f.TenantId, f.OwnerId });

        modelBuilder.Entity<UserFile>()
            .HasOne(f => f.Owner)
            .WithMany()
            .HasForeignKey(f => f.OwnerId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserFile>()
            .HasOne(f => f.Tenant)
            .WithMany(t => t.UserFiles)
            .HasForeignKey(f => f.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

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
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserNotificationPreference>()
            .HasIndex(preference => new { preference.UserId, preference.Type, preference.Channel })
            .IsUnique();

        modelBuilder.Entity<DomainEvent>()
            .Property(domainEvent => domainEvent.Type)
            .HasConversion<int>();

        modelBuilder.Entity<DomainEvent>()
            .Property(domainEvent => domainEvent.Summary)
            .HasMaxLength(512);

        modelBuilder.Entity<DomainEvent>()
            .HasIndex(domainEvent => new { domainEvent.TenantId, domainEvent.OccurredAt });

        modelBuilder.Entity<EventDelivery>()
            .Property(delivery => delivery.Channel)
            .HasConversion<int>();

        modelBuilder.Entity<EventDelivery>()
            .HasOne(delivery => delivery.DomainEvent)
            .WithMany()
            .HasForeignKey(delivery => delivery.DomainEventId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EventDelivery>()
            .HasOne(delivery => delivery.User)
            .WithMany()
            .HasForeignKey(delivery => delivery.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EventDelivery>()
            .HasIndex(delivery => new { delivery.UserId, delivery.TenantId, delivery.Channel, delivery.ReadAt });

        modelBuilder.Entity<EventDelivery>()
            .Property(delivery => delivery.LastError)
            .HasMaxLength(2048);

        modelBuilder.Entity<EventDelivery>()
            .HasIndex(delivery => new { delivery.Channel, delivery.SentAt, delivery.QueuedAt });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ChangeTracker.DetectChanges();

        var pendingAuditLogs = CreatePendingAuditLogs();
        if (pendingAuditLogs.Count == 0)
        {
            return await base.SaveChangesAsync(cancellationToken);
        }

        if (Database.CurrentTransaction is not null)
        {
            return await SaveChangesWithAuditAsync(pendingAuditLogs, cancellationToken);
        }

        var executionStrategy = Database.CreateExecutionStrategy();
        return await executionStrategy.ExecuteAsync(async () =>
        {
            await using var transaction = await Database.BeginTransactionAsync(cancellationToken);
            var result = await SaveChangesWithAuditAsync(pendingAuditLogs, cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return result;
        });
    }

    protected static void ConfigureGlobalIdIndexes(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes()
            .Where(entityType => typeof(DbEntity).IsAssignableFrom(entityType.ClrType)))
        {
            modelBuilder.Entity(entityType.ClrType)
                .Property(nameof(DbEntity.GlobalId))
                .IsRequired();

            modelBuilder.Entity(entityType.ClrType)
                .HasIndex(nameof(DbEntity.GlobalId))
                .IsUnique();
        }
    }

    private async Task<int> SaveChangesWithAuditAsync(List<PendingAuditLog> pendingAuditLogs, CancellationToken cancellationToken)
    {
        var result = await base.SaveChangesAsync(cancellationToken);

        AuditLogs.AddRange(pendingAuditLogs.Select(CreateAuditLog));
        await base.SaveChangesAsync(cancellationToken);

        return result;
    }

    private List<PendingAuditLog> CreatePendingAuditLogs()
    {
        var userId = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

        return [.. ChangeTracker
            .Entries()
            .Where(entry => entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .Where(entry => entry.Entity is DbEntity and not AuditLog)
            .Select(entry => CreatePendingAuditLog(entry, userId))];
    }

    private static PendingAuditLog CreatePendingAuditLog(EntityEntry entry, string? userId)
    {
        var entity = (DbEntity)entry.Entity;

        return new PendingAuditLog(
            UserId: userId,
            EntityType: entry.Metadata.ClrType.Name,
            Entity: entity,
            EntityState: entry.State,
            PropertyChanges: GetPropertyChanges(entry));
    }

    private static AuditLog CreateAuditLog(PendingAuditLog pendingAuditLog)
    {
        return new AuditLog
        {
            Timestamp = DateTime.UtcNow,
            UserId = pendingAuditLog.UserId,
            EntityType = pendingAuditLog.EntityType,
            EntityId = pendingAuditLog.Entity.Id,
            EntityState = pendingAuditLog.EntityState.ToString(),
            ChangesJson = JsonSerializer.Serialize(
                pendingAuditLog.PropertyChanges.ToDictionary(
                    property => property.Name,
                    property => property.ToAuditPropertyChange()),
                AuditJsonOptions)
        };
    }

    private static List<PendingAuditPropertyChange> GetPropertyChanges(EntityEntry entry)
    {
        return [.. entry.Properties
            .Where(property => !property.Metadata.IsShadowProperty())
            .Where(property => property.Metadata.Name != nameof(DbEntity.Id))
            .Where(property => entry.State != EntityState.Modified || property.IsModified)
            .Select(property => CreatePropertyChange(property, entry.State))];
    }

    private static PendingAuditPropertyChange CreatePropertyChange(PropertyEntry property, EntityState entityState)
    {
        return entityState switch
        {
            EntityState.Added => new PendingAuditPropertyChange(property.Metadata.Name, OldValue: null, NewValue: null, property),
            EntityState.Deleted => new PendingAuditPropertyChange(property.Metadata.Name, property.OriginalValue, NewValue: null, Property: null),
            _ => new PendingAuditPropertyChange(property.Metadata.Name, property.OriginalValue, NewValue: null, property)
        };
    }

    /// <summary>
    /// Contains audit log data waiting to be persisted.
    /// </summary>
    private sealed record PendingAuditLog(
        string? UserId,
        string EntityType,
        DbEntity Entity,
        EntityState EntityState,
        List<PendingAuditPropertyChange> PropertyChanges);

    /// <summary>
    /// Contains pending audit data for one changed property.
    /// </summary>
    private sealed record PendingAuditPropertyChange(
        string Name,
        object? OldValue,
        object? NewValue,
        PropertyEntry? Property)
    {
        public AuditPropertyChange ToAuditPropertyChange()
        {
            return new AuditPropertyChange(OldValue, Property?.CurrentValue ?? NewValue);
        }
    }

    /// <summary>
    /// Contains old and new values for an audited property.
    /// </summary>
    private sealed record AuditPropertyChange(object? OldValue, object? NewValue);
}
