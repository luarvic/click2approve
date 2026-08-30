using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;
using Click2Approve.EventPublisher.Services;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace Click2Approve.EventWorkers.Tests.Events;

/// <summary>
/// Tests event outbox publication behavior.
/// </summary>
public sealed class EventQueuePublisherServiceTests
{
    /// <summary>
    /// Verifies that the publisher limits concurrent queue sends and persists every successful publication.
    /// </summary>
    [Fact]
    public async Task Publisher_WhenPublishingBatch_UsesConfiguredConcurrencyAndPersistsSuccessfulMessages()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var queue = new DelayedEventQueue(expectedMessageCount: 4);
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["EventQueue:Publisher:BatchSize"] = "4",
                    ["EventQueue:Publisher:IdleDelaySeconds"] = "1",
                    ["EventQueue:Publisher:MaxConcurrentPublishes"] = "2"
                })
            .Build();
        var services = new ServiceCollection();
        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.AddDbContext<ApiDbContext>(options => options.UseSqlite(connection));
        await using var serviceProvider = services.BuildServiceProvider();

        await SeedMessagesAsync(serviceProvider);
        var publisher = new EventQueuePublisherService(
            queue,
            serviceProvider.GetRequiredService<IServiceScopeFactory>(),
            configuration,
            NullLogger<EventQueuePublisherService>.Instance);

        await publisher.StartAsync(CancellationToken.None);
        try
        {
            await queue.Published.Task.WaitAsync(TimeSpan.FromSeconds(5));
            await WaitForPublishedMessagesAsync(serviceProvider, expectedMessageCount: 4);

            Assert.Equal(2, queue.MaximumConcurrentPublishes);
        }
        finally
        {
            await publisher.StopAsync(CancellationToken.None);
        }
    }

    private static async Task SeedMessagesAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        await db.Database.EnsureCreatedAsync();
        db.EventOutboxMessages.AddRange(
            Enumerable.Range(0, 4).Select(index => new EventOutboxMessage
            {
                EventId = Guid.NewGuid(),
                EventType = "test.event.v1",
                OccurredAt = DateTime.UtcNow.AddSeconds(index),
                Payload = "{}"
            }));
        await db.SaveChangesAsync();
    }

    private static async Task WaitForPublishedMessagesAsync(IServiceProvider serviceProvider, int expectedMessageCount)
    {
        var timeoutAt = DateTime.UtcNow.AddSeconds(5);
        while (DateTime.UtcNow < timeoutAt)
        {
            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
            if (await db.EventOutboxMessages.CountAsync(message => message.PublishedAt != null) == expectedMessageCount) return;

            await Task.Delay(TimeSpan.FromMilliseconds(10));
        }

        throw new TimeoutException("The publisher did not persist the expected number of messages.");
    }

    private sealed class DelayedEventQueue(int expectedMessageCount) : IEventQueue
    {
        private int _activePublishes;
        private int _maximumConcurrentPublishes;
        private int _publishedCount;

        public TaskCompletionSource Published { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);

        public int MaximumConcurrentPublishes => _maximumConcurrentPublishes;

        public Task CompleteAsync(ReceivedEvent receivedEvent, CancellationToken cancellationToken) => Task.CompletedTask;

        public async Task EnqueueAsync(EventEnvelope envelope, CancellationToken cancellationToken)
        {
            var activePublishes = Interlocked.Increment(ref _activePublishes);
            UpdateMaximum(activePublishes);
            await Task.Delay(TimeSpan.FromMilliseconds(50), cancellationToken);
            if (Interlocked.Increment(ref _publishedCount) == expectedMessageCount) Published.TrySetResult();
            Interlocked.Decrement(ref _activePublishes);
        }

        public Task MoveToPoisonAsync(ReceivedEvent receivedEvent, string error, CancellationToken cancellationToken) =>
            Task.CompletedTask;

        public Task<IReadOnlyCollection<ReceivedEvent>> ReceiveAsync(
            int maximumCount,
            TimeSpan visibilityTimeout,
            CancellationToken cancellationToken) => Task.FromResult<IReadOnlyCollection<ReceivedEvent>>([]);

        public Task RetryAsync(ReceivedEvent receivedEvent, TimeSpan delay, CancellationToken cancellationToken) => Task.CompletedTask;

        private void UpdateMaximum(int activePublishes)
        {
            while (true)
            {
                var maximumConcurrentPublishes = MaximumConcurrentPublishes;
                if (activePublishes <= maximumConcurrentPublishes) return;
                if (Interlocked.CompareExchange(
                        ref _maximumConcurrentPublishes,
                        activePublishes,
                        maximumConcurrentPublishes) == maximumConcurrentPublishes) return;
            }
        }
    }
}
