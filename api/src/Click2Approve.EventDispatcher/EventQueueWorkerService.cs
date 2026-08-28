using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;

namespace Click2Approve.EventDispatcher;

/// <summary>
/// Runs the configured number of Azure Queue event consumers.
/// </summary>
public sealed class EventQueueWorkerService(
    IEventQueue eventQueue,
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<EventQueueWorkerService> logger) : BackgroundService
{
    private readonly IEventQueue _eventQueue = eventQueue;
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger<EventQueueWorkerService> _logger = logger;

    /// <inheritdoc />
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var workerCount = Math.Max(1, _configuration.GetValue<int>("EventQueue:WorkerCount"));
        return Task.WhenAll(Enumerable.Range(0, workerCount).Select(_ => ConsumeAsync(stoppingToken)));
    }

    private async Task ConsumeAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var receivedEvents = await _eventQueue.ReceiveAsync(
                    maximumCount: 1,
                    visibilityTimeout: GetVisibilityTimeout(),
                    cancellationToken: stoppingToken);
                var receivedEvent = receivedEvents.SingleOrDefault();
                if (receivedEvent is null)
                {
                    await Task.Delay(GetIdleDelay(), stoppingToken);
                    continue;
                }

                await HandleAsync(receivedEvent, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                return;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An event queue consumer failed before it could complete its loop.");
                await Task.Delay(GetIdleDelay(), stoppingToken);
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
        var maximumAttempts = Math.Max(1, _configuration.GetValue<int>("EventQueue:MaximumAttempts"));
        if (receivedEvent.DequeueCount >= maximumAttempts)
        {
            await _eventQueue.MoveToPoisonAsync(receivedEvent, exception.Message, cancellationToken);
            _logger.LogError(exception, "Moved event {EventId} to the poison queue.", receivedEvent.Envelope.EventId);
            return;
        }

        var delay = TimeSpan.FromSeconds(Math.Min(
            Math.Max(1, _configuration.GetValue<int>("EventQueue:MaximumRetryDelaySeconds")),
            Math.Pow(2, receivedEvent.DequeueCount)));
        await _eventQueue.RetryAsync(receivedEvent, delay, cancellationToken);
        _logger.LogWarning(exception, "Will retry event {EventId} after {Delay}.", receivedEvent.Envelope.EventId, delay);
    }

    private TimeSpan GetIdleDelay() => TimeSpan.FromSeconds(Math.Max(
        1,
        _configuration.GetValue<int>("EventQueue:IdleDelaySeconds")));

    private TimeSpan GetVisibilityTimeout() => TimeSpan.FromSeconds(Math.Max(
        1,
        _configuration.GetValue<int>("EventQueue:VisibilityTimeoutSeconds")));
}
