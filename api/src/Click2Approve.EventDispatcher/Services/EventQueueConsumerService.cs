using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;

namespace Click2Approve.EventDispatcher.Services;

/// <summary>
/// Runs the configured number of Azure Queue event consumers.
/// </summary>
public sealed class EventQueueConsumerService(
    IEventQueue eventQueue,
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<EventQueueConsumerService> logger) : BackgroundService
{
    private const int MaximumMessagesPerReceive = 32;

    private readonly IEventQueue _eventQueue = eventQueue;
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger<EventQueueConsumerService> _logger = logger;

    /// <inheritdoc />
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var batchSize = Math.Clamp(
            _configuration.GetValue<int>("EventQueue:Consumer:BatchSize"), 1, MaximumMessagesPerReceive);
        var workerCount = Math.Max(1, _configuration.GetValue<int>("EventQueue:Consumer:WorkerCount"));
        var idleDelay = TimeSpan.FromSeconds(Math.Max(1, _configuration.GetValue<int>("EventQueue:Consumer:IdleDelaySeconds")));
        var visibilityTimeout = TimeSpan.FromSeconds(Math.Max(1, _configuration.GetValue<int>("EventQueue:Consumer:VisibilityTimeoutSeconds")));
        return Task.WhenAll(Enumerable.Range(0, workerCount).Select(_ => ConsumeAsync(batchSize, idleDelay, visibilityTimeout, stoppingToken)));
    }

    private async Task ConsumeAsync(
        int batchSize,
        TimeSpan idleDelay,
        TimeSpan visibilityTimeout,
        CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var receivedEvents = await _eventQueue.ReceiveAsync(
                    maximumCount: batchSize,
                    visibilityTimeout: visibilityTimeout,
                    cancellationToken: stoppingToken);
                if (receivedEvents.Count == 0)
                {
                    await Task.Delay(idleDelay, stoppingToken);
                    continue;
                }

                foreach (var receivedEvent in receivedEvents)
                {
                    await HandleAsync(receivedEvent, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                return;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An event queue consumer failed before it could complete its loop.");
                await Task.Delay(idleDelay, stoppingToken);
            }
        }
    }

    private async Task HandleAsync(ReceivedEvent receivedEvent, CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var handler = scope.ServiceProvider
                .GetServices<IEventHandler>()
                .SingleOrDefault(item => item.EventType == receivedEvent.Envelope.EventType)
                ?? throw new InvalidOperationException($"No handler is registered for '{receivedEvent.Envelope.EventType}'.");
            await handler.HandleAsync(receivedEvent.Envelope, stoppingToken);
            await _eventQueue.CompleteAsync(receivedEvent, stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            await HandleFailureAsync(receivedEvent, exception, stoppingToken);
        }
    }

    private async Task HandleFailureAsync(ReceivedEvent receivedEvent, Exception exception, CancellationToken cancellationToken)
    {
        var maximumAttempts = Math.Max(1, _configuration.GetValue<int>("EventQueue:Consumer:MaximumAttempts"));
        if (receivedEvent.DequeueCount >= maximumAttempts)
        {
            await _eventQueue.MoveToPoisonAsync(receivedEvent, exception.Message, cancellationToken);
            _logger.LogError(exception, "Moved event {EventId} to the poison queue.", receivedEvent.Envelope.EventId);
            return;
        }

        var delay = TimeSpan.FromSeconds(Math.Min(
            Math.Max(1, _configuration.GetValue<int>("EventQueue:Consumer:MaximumRetryDelaySeconds")),
            Math.Pow(2, receivedEvent.DequeueCount)));
        await _eventQueue.RetryAsync(receivedEvent, delay, cancellationToken);
        _logger.LogWarning(exception, "Will retry event {EventId} after {Delay}.", receivedEvent.Envelope.EventId, delay);
    }
}
