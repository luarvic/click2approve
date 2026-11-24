using System.Text.Json;
using Azure.Storage.Queues;
using Click2Approve.Application.Abstractions.Auditing;
using Click2Approve.Application.Abstractions.FileStorage;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;
using Click2Approve.EventConsumer.Handlers;
using Click2Approve.EventPublisher.Services;
using Click2Approve.EventWorkers.Tests.Integration;
using Click2Approve.Infrastructure.Events;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

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

    [AzuriteFact]
    public async Task Scheduler_Dispatcher_AndConsumer_DeleteFileAndCleanOnlyExpiredPublishedEvents()
    {
        var connectionString = $"Data Source={Guid.NewGuid():N};Mode=Memory;Cache=Shared";
        await using var anchor = new SqliteConnection(connectionString);
        await anchor.OpenAsync();
        var services = new ServiceCollection();
        services.AddSingleton<IAuditContext, DisabledAuditContext>();
        services.AddDbContext<ApiDbContext>(options => options.UseSqlite(connectionString));
        await using var provider = services.BuildServiceProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        await db.Database.EnsureCreatedAsync();
        var file = await AddScheduledUserFileAsync(db);
        var storageConnection = Environment.GetEnvironmentVariable("C2A_TEST_AZURITE")!;
        var queueName = $"retention-{Guid.NewGuid():N}";
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["EventQueue:ConnectionString"] = storageConnection,
            ["EventQueue:Queues:Low:Name"] = queueName,
            ["EventQueue:Priorities:Low:0"] = EventTypes.DeletionRequestedV1
        }).Build();
        var scopes = provider.GetRequiredService<IServiceScopeFactory>();
        using var scheduler = new DeletionEventPublisherService(scopes, configuration, NullLogger<DeletionEventPublisherService>.Instance);
        await db.Database.ExecuteSqlRawAsync("""
            CREATE TRIGGER fail_command BEFORE INSERT ON EventOutboxMessages
            BEGIN SELECT RAISE(ABORT, 'simulated outbox insert failure'); END;
            """);
        await Assert.ThrowsAsync<DbUpdateException>(() => scheduler.ScheduleBatchAsync(1, default));
        Assert.Null(await db.UserFiles.Select(item => item.DeletionRequestedAt).SingleAsync());
        Assert.Empty(await db.EventOutboxMessages.ToListAsync());
        await db.Database.ExecuteSqlRawAsync("DROP TRIGGER fail_command");

        // Both schedulers read an unclaimed file. Commit the other scheduler before the first saves.
        using var overlapping = new OverlappingScheduler(scopes, configuration, scheduler);
        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => overlapping.ScheduleBatchAsync(1, default));
        Assert.Equal(0, await scheduler.ScheduleBatchAsync(1, default));
        var command = await db.EventOutboxMessages.AsNoTracking().SingleAsync();
        Assert.Null(command.PublishedAt);
        Assert.NotNull(await db.UserFiles.Select(item => item.DeletionRequestedAt).SingleAsync());

        var queue = new AzureEventQueue(configuration, new UnusedTokenCredential());
        var client = new QueueClient(storageConnection, queueName);
        var storage = new RecordingUserFileStorage();
        using var dispatcher = new EventQueuePublisherService(queue, new ConfigurationEventPriorityResolver(configuration),
            scopes, configuration, NullLogger<EventQueuePublisherService>.Instance);
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(20));
        try
        {
            await dispatcher.StartAsync(timeout.Token);
            while (!await db.EventOutboxMessages.AnyAsync(item => item.PublishedAt != null, timeout.Token))
                await Task.Delay(25, timeout.Token);
            await dispatcher.StopAsync(timeout.Token);
            var received = Assert.Single(await queue.ReceiveAsync(EventPriority.Low, 1, TimeSpan.FromSeconds(30), timeout.Token));
            Assert.Equal(command.EventId, received.Envelope.EventId);
            db.ChangeTracker.Clear();
            var handler = new DeletionRequestedEventHandler(db, storage);
            await handler.HandleAsync(received.Envelope, timeout.Token);
            await handler.HandleAsync(received.Envelope, timeout.Token);
            await queue.CompleteAsync(received, timeout.Token);
            Assert.Equal([file.GlobalId], storage.DeletedFileGlobalIds);
            Assert.Empty(await db.UserFiles.ToListAsync());
            Assert.Equal(0, await OutboxCleanupService.DeleteBatchAsync(db, DateTime.UtcNow.AddMonths(-1), 1, default));
            db.EventOutboxMessages.Add(new EventOutboxMessage
            {
                EventId = Guid.NewGuid(),
                OccurredAt = DateTime.UtcNow.AddYears(-1),
                EventType = EventTypes.NotificationRequestedV1,
                Payload = "{}"
            });
            await db.SaveChangesAsync();
            Assert.Equal(1, await OutboxCleanupService.DeleteBatchAsync(db, DateTime.UtcNow, 1, default));
            Assert.Null((await db.EventOutboxMessages.SingleAsync()).PublishedAt);
            Assert.Equal(0, await scheduler.ScheduleBatchAsync(1, default));
        }
        finally
        {
            await dispatcher.StopAsync(default);
            await client.DeleteIfExistsAsync();
        }
    }

    private sealed class OverlappingScheduler(IServiceScopeFactory scopes, IConfiguration configuration,
        DeletionEventPublisherService other) : DeletionEventPublisherService(scopes, configuration, NullLogger<DeletionEventPublisherService>.Instance)
    {
        protected override async Task<IReadOnlyCollection<DeletionCandidate>> ListCandidatesAsync(ApiDbContext db, int batchSize,
            CancellationToken cancellationToken)
        {
            var candidates = await base.ListCandidatesAsync(db, batchSize, cancellationToken);
            Assert.Equal(1, await other.ScheduleBatchAsync(batchSize, cancellationToken));
            return candidates;
        }
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
            SubscriptionPlan = SubscriptionPlan.PersonalFree,
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
