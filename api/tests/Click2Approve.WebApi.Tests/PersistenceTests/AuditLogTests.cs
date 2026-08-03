using System.Security.Claims;
using System.Text.Json;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.WebApi.Tests.PersistenceTests;

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
        var userId = Guid.NewGuid().ToString();
        var httpContextAccessor = new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    [new Claim(ClaimTypes.NameIdentifier, userId)],
                    authenticationType: "Test"))
            }
        };

        await using var db = new ApiDbContext(options, httpContextAccessor);
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
            Size = 42
        };

        db.UserFiles.Add(userFile);
        await db.SaveChangesAsync();

        var auditLog = await db.AuditLogs
            .SingleAsync(log => log.EntityType == nameof(UserFile) && log.EntityId == userFile.Id);

        Assert.Equal(userId, auditLog.UserId);
        Assert.Equal(nameof(UserFile), auditLog.EntityType);
        Assert.Equal(EntityState.Added.ToString(), auditLog.EntityState);

        using var changes = JsonDocument.Parse(auditLog.ChangesJson);
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
        var userId = Guid.NewGuid().ToString();
        var httpContextAccessor = new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    [new Claim(ClaimTypes.NameIdentifier, userId)],
                    authenticationType: "Test"))
            }
        };

        await using var db = new ApiDbContext(options, httpContextAccessor);
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
            Size = 42
        };
        var approvalRequest = new ApprovalRequest
        {
            Title = "Contract",
            CreatedAt = DateTime.UtcNow,
            CreatedByUser = owner,
            CreatedByUserId = owner.Id,
            CreatedByEmail = owner.Email,
            CreatedByDisplayName = "Owner",
            CreatedByOrganizationDisplayName = "Personal",
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
            approvalRequest.Id,
            changes.RootElement.GetProperty(nameof(ApprovalRequestFile.ApprovalRequestId)).GetProperty("newValue").GetInt64());
    }
}
