using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;
using Click2Approve.EventConsumer.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace Click2Approve.EventWorkers.Tests.Events;

/// <summary>
/// Tests queue-consumer visibility timeout handling.
/// </summary>
public sealed class EventQueueConsumerServiceTests
{
    /// <summary>
    /// Verifies processing that exceeds the visibility timeout is abandoned for queue redelivery.
    /// </summary>
    [Fact]
    public async Task Consumer_WhenHandlingExceedsVisibilityTimeout_AbandonsMessage()
    {
        var queue = new TestEventQueue();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["EventQueue:Consumer:IdleDelaySeconds"] = "1",
                    ["EventQueue:Consumer:MaximumAttempts"] = "5",
                    ["EventQueue:Consumer:MaximumRetryDelaySeconds"] = "300",
                    ["EventQueue:Consumer:VisibilityTimeoutSeconds"] = "1",
                    ["EventQueue:Consumer:Workers:High"] = "1"
                })
            .Build();
        var services = new ServiceCollection();
        var cancellationSignal = new CancellationSignal();
        services.AddSingleton(cancellationSignal);
        services.AddScoped<IEventHandler, DelayedEventHandler>();
        await using var serviceProvider = services.BuildServiceProvider();
        var consumer = new EventQueueConsumerService(
            queue,
            serviceProvider.GetRequiredService<IServiceScopeFactory>(),
            configuration,
            NullLogger<EventQueueConsumerService>.Instance);

        await consumer.StartAsync(CancellationToken.None);
        await cancellationSignal.Cancelled.Task.WaitAsync(TimeSpan.FromSeconds(5));
        await consumer.StopAsync(CancellationToken.None);

        Assert.Equal(0, queue.CompletionCount);
        Assert.Equal(1, queue.MaximumRequestedMessageCount);
        Assert.Equal(0, queue.PoisonCount);
        Assert.Equal(0, queue.RetryCount);
    }

    private sealed class DelayedEventHandler(CancellationSignal cancellationSignal) : IEventHandler
    {
        private readonly CancellationSignal _cancellationSignal = cancellationSignal;

        public string EventType => "test.event.v1";

        public async Task HandleAsync(EventEnvelope envelope, CancellationToken cancellationToken)
        {
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(2), cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                _cancellationSignal.Cancelled.TrySetResult();
                throw;
            }
        }
    }

    private sealed class CancellationSignal
    {
        public TaskCompletionSource Cancelled { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
    }

    private sealed class TestEventQueue : IEventQueue
    {
        private readonly ReceivedEvent _receivedEvent = new(
            new EventEnvelope(Guid.NewGuid(), "test.event.v1", DateTime.UtcNow, "{}"),
            EventPriority.High,
            "message-id",
            "initial-pop-receipt",
            1);
        private int _receiveCount;

        public int CompletionCount { get; private set; }
        public int MaximumRequestedMessageCount { get; private set; }
        public int PoisonCount { get; private set; }
        public int RetryCount { get; private set; }

        public Task CompleteAsync(ReceivedEvent receivedEvent, CancellationToken cancellationToken)
        {
            CompletionCount++;
            return Task.CompletedTask;
        }

        public Task EnqueueAsync(EventPriority priority, EventEnvelope envelope, CancellationToken cancellationToken) => Task.CompletedTask;

        public Task MoveToPoisonAsync(ReceivedEvent receivedEvent, string error, CancellationToken cancellationToken)
        {
            PoisonCount++;
            return Task.CompletedTask;
        }

        public Task<IReadOnlyCollection<ReceivedEvent>> ReceiveAsync(
            EventPriority priority,
            int maximumCount,
            TimeSpan visibilityTimeout,
            CancellationToken cancellationToken)
        {
            MaximumRequestedMessageCount = Math.Max(MaximumRequestedMessageCount, maximumCount);
            return Task.FromResult<IReadOnlyCollection<ReceivedEvent>>(
                Interlocked.Increment(ref _receiveCount) == 1 ? [_receivedEvent] : []);
        }

        public Task RetryAsync(ReceivedEvent receivedEvent, TimeSpan delay, CancellationToken cancellationToken)
        {
            RetryCount++;
            return Task.CompletedTask;
        }
    }
}
