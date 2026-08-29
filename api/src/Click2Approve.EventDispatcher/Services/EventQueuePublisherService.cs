using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.EventDispatcher.Services;

/// <summary>
/// Reliably publishes committed outbox messages to Azure Queue Storage.
/// </summary>
public sealed class EventQueuePublisherService(
    IEventQueue eventQueue,
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<EventQueuePublisherService> logger) : BackgroundService
{
    private readonly IEventQueue _eventQueue = eventQueue;
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger<EventQueuePublisherService> _logger = logger;

    /// <inheritdoc />
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var batchSize = Math.Max(1, _configuration.GetValue<int>("EventQueue:Publisher:BatchSize"));
        var idleDelay = TimeSpan.FromSeconds(Math.Max(1, _configuration.GetValue<int>("EventQueue:Publisher:IdleDelaySeconds")));
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
                var messages = await db.EventOutboxMessages
                    .Where(message => message.PublishedAt == null)
                    .OrderBy(message => message.OccurredAt)
                    .Take(batchSize)
                    .ToListAsync(stoppingToken);
                foreach (var message in messages)
                {
                    await _eventQueue.EnqueueAsync(
                        new EventEnvelope(message.EventId, message.EventType, message.OccurredAt, message.Payload),
                        stoppingToken);
                    message.PublishedAt = DateTime.UtcNow;
                }

                await db.SaveChangesAsync(stoppingToken);
                if (messages.Count == 0) await Task.Delay(idleDelay, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { return; }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Outbox publication failed.");
                await Task.Delay(idleDelay, stoppingToken);
            }
        }
    }
}
