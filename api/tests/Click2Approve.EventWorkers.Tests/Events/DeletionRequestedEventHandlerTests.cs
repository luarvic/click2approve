using System.Text.Json;
using Click2Approve.Application.Abstractions.Auditing;
using Click2Approve.Application.Abstractions.FileStorage;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;
using Click2Approve.EventConsumer.Handlers;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.EventWorkers.Tests.Events;

/// <summary>
/// Tests scheduled user-file deletion event handling.
/// </summary>
public sealed class DeletionRequestedEventHandlerTests
{
    /// <summary>
    /// Verifies that duplicate user-file deletion events are idempotent.
    /// </summary>
    [Fact]
    public async Task Handler_WhenUserFileDeletionIsDeliveredTwice_DeletesStorageAndDatabaseOnce()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<ApiDbContext>().UseSqlite(connection).Options;
        await using var db = new ApiDbContext(options, new DisabledAuditContext());
        await db.Database.EnsureCreatedAsync();

        var userFile = await AddScheduledUserFileAsync(db);
        var fileStorage = new RecordingUserFileStorage();
        var handler = new DeletionRequestedEventHandler(db, fileStorage);
        var envelope = new EventEnvelope(
            Guid.NewGuid(),
            EventTypes.DeletionRequestedV1,
            DateTime.UtcNow,
            JsonSerializer.Serialize(
                new DeletionRequestedPayload(DeletionTargetType.UserFile, userFile.GlobalId),
                EventJson.Options));

        await handler.HandleAsync(envelope, CancellationToken.None);
        await handler.HandleAsync(envelope, CancellationToken.None);

        Assert.Equal([userFile.GlobalId], fileStorage.DeletedFileGlobalIds);
        Assert.False(await db.UserFiles.AnyAsync(file => file.GlobalId == userFile.GlobalId));
    }

    private static async Task<UserFile> AddScheduledUserFileAsync(ApiDbContext db)
    {
        var owner = new AppUser
        {
            Id = 1,
            UserName = "owner@example.com",
            Email = "owner@example.com"
        };
        var tenant = new Tenant
        {
            BusinessName = "Personal",
            Owner = owner,
            Type = TenantType.Personal
        };
        db.AddRange(owner, tenant);
        await db.SaveChangesAsync();

        var userFile = new UserFile
        {
            CreatedAt = DateTime.UtcNow,
            Name = "contract.txt",
            OwnerId = owner.Id,
            ScheduledForDeletionAt = DateTime.UtcNow,
            Size = 42,
            StorageType = UserFileStorageType.Private,
            TenantId = tenant.Id,
            Type = "text/plain"
        };
        db.UserFiles.Add(userFile);
        await db.SaveChangesAsync();
        return userFile;
    }

    private sealed class RecordingUserFileStorage : IUserFileStorage
    {
        public List<Guid> DeletedFileGlobalIds { get; } = [];

        public Task DeleteAsync(UserFile userFile, CancellationToken cancellationToken)
        {
            DeletedFileGlobalIds.Add(userFile.GlobalId);
            return Task.CompletedTask;
        }

        public string GetPublicUrl(UserFile userFile) => throw new NotSupportedException();

        public Task<byte[]> ReadAsync(UserFile userFile, CancellationToken cancellationToken) => throw new NotSupportedException();

        public Task SaveAsync(UserFile userFile, byte[] bytes, CancellationToken cancellationToken) => throw new NotSupportedException();
    }
}
