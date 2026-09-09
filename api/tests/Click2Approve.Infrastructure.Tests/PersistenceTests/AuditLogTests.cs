using System.Text.Json;
using Click2Approve.Application.Abstractions.Auditing;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Tests.PersistenceTests;

/// <summary>
/// Tests audit log persistence behavior.
/// </summary>
public class AuditLogTests
{
    [Fact]
    public async Task SaveChangesAsync_AddsAuditLogForDomainEntity()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApiDbContext>()
            .UseSqlite(connection)
            .Options;
        const long userId = 1;
        await using var db = new ApiDbContext(options, new TestAuditContext(userId));
        await db.Database.EnsureCreatedAsync();

        var owner = new AppUser
        {
            Id = userId,
            UserName = "owner@example.com",
            Email = "owner@example.com"
        };
        var tenant = new Tenant
        {
            BusinessName = "Personal",
            Type = TenantType.Personal,
            SubscriptionPlan = SubscriptionPlan.PersonalFree,
            Owner = owner
        };

        db.Users.Add(owner);
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();

        var userFile = new UserFile
        {
            Name = "contract.txt",
            Type = "text/plain",
            CreatedAt = DateTime.UtcNow,
            OwnerId = owner.Id,
            TenantId = tenant.Id,
            Size = 42,
            StorageType = UserFileStorageType.Private
        };

        db.UserFiles.Add(userFile);
        await db.SaveChangesAsync();

        var auditLog = await db.AuditLogs
            .SingleAsync(log => log.EntityType == nameof(UserFile) && log.EntityId == userFile.Id);

        Assert.Equal(userId, auditLog.UserId);
        Assert.Equal(nameof(UserFile), auditLog.EntityType);
        Assert.Equal(EntityState.Added.ToString(), auditLog.EntityState);

        using var changes = JsonDocument.Parse(auditLog.ChangesJson);
        Assert.Equal(userFile.GlobalId, changes.RootElement.GetProperty(nameof(UserFile.GlobalId)).GetProperty("newValue").GetGuid());
        Assert.Equal("contract.txt", changes.RootElement.GetProperty(nameof(UserFile.Name)).GetProperty("newValue").GetString());
    }

    [Fact]
    public async Task SaveChangesAsync_AuditLogUsesResolvedForeignKeysForAddedEntities()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApiDbContext>()
            .UseSqlite(connection)
            .Options;
        const long userId = 2;
        await using var db = new ApiDbContext(options, new TestAuditContext(userId));
        await db.Database.EnsureCreatedAsync();

        var owner = new AppUser
        {
            Id = userId,
            UserName = "owner@example.com",
            Email = "owner@example.com"
        };
        var tenant = new Tenant
        {
            BusinessName = "Personal",
            Type = TenantType.Personal,
            SubscriptionPlan = SubscriptionPlan.PersonalFree,
            Owner = owner
        };
        var userFile = new UserFile
        {
            Name = "contract.txt",
            Type = "text/plain",
            CreatedAt = DateTime.UtcNow,
            Owner = owner,
            OwnerId = owner.Id,
            Tenant = tenant,
            Size = 42,
            StorageType = UserFileStorageType.Private
        };
        var approvalRequest = new ApprovalRequest
        {
            Title = "Contract",
            CreatedAt = DateTime.UtcNow,
            CreatedByUser = owner,
            CreatedByUserId = owner.Id,
            CreatedByDisplayName = "Owner",
            OrganizationDisplayName = "Personal",
            Tenant = tenant,
            Status = ApprovalRequestStatus.Draft,
            Steps = [],
            Description = null
        };
        var approvalRequestFile = new ApprovalRequestFile
        {
            ApprovalRequest = approvalRequest,
            UserFile = userFile,
            RevisionAction = ApprovalRequestFileRevisionAction.Added,
            Sequence = 0
        };

        db.ApprovalRequestFiles.Add(approvalRequestFile);
        await db.SaveChangesAsync();

        var auditLog = await db.AuditLogs
            .SingleAsync(log => log.EntityType == nameof(ApprovalRequestFile) && log.EntityId == approvalRequestFile.Id);

        using var changes = JsonDocument.Parse(auditLog.ChangesJson);
        Assert.Equal(
            approvalRequestFile.GlobalId,
            changes.RootElement.GetProperty(nameof(ApprovalRequestFile.GlobalId)).GetProperty("newValue").GetGuid());
        Assert.Equal(
            approvalRequest.Id,
            changes.RootElement.GetProperty(nameof(ApprovalRequestFile.ApprovalRequestId)).GetProperty("newValue").GetInt64());
    }

    [Fact]
    public async Task SaveChangesAsync_ModifiedAuditLogIncludesOnlyChangedProperties()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApiDbContext>()
            .UseSqlite(connection)
            .Options;
        const long userId = 3;
        await using var db = new ApiDbContext(options, new TestAuditContext(userId));
        await db.Database.EnsureCreatedAsync();

        var owner = new AppUser
        {
            Id = userId,
            UserName = "owner@example.com",
            Email = "owner@example.com"
        };
        var tenant = new Tenant
        {
            BusinessName = "Personal",
            Type = TenantType.Personal,
            SubscriptionPlan = SubscriptionPlan.PersonalFree,
            Owner = owner
        };
        var userFile = new UserFile
        {
            Name = "contract.txt",
            Type = "text/plain",
            CreatedAt = DateTime.UtcNow,
            OwnerId = owner.Id,
            Tenant = tenant,
            Size = 42,
            StorageType = UserFileStorageType.Private
        };

        db.UserFiles.Add(userFile);
        await db.SaveChangesAsync();

        userFile.Name = "updated-contract.txt";
        await db.SaveChangesAsync();

        var auditLog = await db.AuditLogs
            .SingleAsync(log => log.EntityType == nameof(UserFile)
                && log.EntityId == userFile.Id
                && log.EntityState == EntityState.Modified.ToString());

        using var changes = JsonDocument.Parse(auditLog.ChangesJson);
        Assert.False(changes.RootElement.TryGetProperty(nameof(UserFile.GlobalId), out _));
        Assert.Equal("contract.txt", changes.RootElement.GetProperty(nameof(UserFile.Name)).GetProperty("oldValue").GetString());
        Assert.Equal("updated-contract.txt", changes.RootElement.GetProperty(nameof(UserFile.Name)).GetProperty("newValue").GetString());
    }

    [Fact]
    public async Task SaveChangesAsync_WhenAuditingIsDisabled_DoesNotAddAuditLog()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApiDbContext>()
            .UseSqlite(connection)
            .Options;
        await using var db = new ApiDbContext(options, new DisabledAuditContext());
        await db.Database.EnsureCreatedAsync();

        db.EventOutboxMessages.Add(new EventOutboxMessage
        {
            EventId = Guid.NewGuid(),
            EventType = "test.event.v1",
            OccurredAt = DateTime.UtcNow,
            Payload = "{}"
        });
        await db.SaveChangesAsync();

        Assert.Empty(await db.AuditLogs.ToListAsync());
    }

    private sealed class TestAuditContext(long? userId) : IAuditContext
    {
        public bool IsEnabled => true;

        public long? UserId => userId;
    }
}
