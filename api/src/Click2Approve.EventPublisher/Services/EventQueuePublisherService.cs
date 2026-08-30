using System.Collections.Concurrent;
using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.EventPublisher.Services;

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

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var batchSize = Math.Max(1, _configuration.GetValue<int>("EventQueue:Publisher:BatchSize"));
        var idleDelay = TimeSpan.FromSeconds(Math.Max(1, _configuration.GetValue<int>("EventQueue:Publisher:IdleDelaySeconds")));
        var maximumConcurrentPublishes = Math.Max(
            1,
            _configuration.GetValue<int>("EventQueue:Publisher:MaxConcurrentPublishes"));
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
                var publishedMessages = new ConcurrentQueue<EventOutboxMessage>();
                var publishExceptions = new ConcurrentQueue<Exception>();
                await Parallel.ForEachAsync(
                    messages,
                    new ParallelOptions
                    {
                        CancellationToken = stoppingToken,
                        MaxDegreeOfParallelism = maximumConcurrentPublishes
                    },
                    async (message, cancellationToken) =>
                    {
                        try
                        {
                            await _eventQueue.EnqueueAsync(
                                new EventEnvelope(message.EventId, message.EventType, message.OccurredAt, message.Payload),
                                cancellationToken);
                            publishedMessages.Enqueue(message);
                        }
                        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                        {
                            throw;
                        }
                        catch (Exception exception)
                        {
                            publishExceptions.Enqueue(exception);
                        }
                    });

                foreach (var message in publishedMessages) message.PublishedAt = DateTime.UtcNow;
                if (!publishedMessages.IsEmpty) await db.SaveChangesAsync(stoppingToken);
                if (!publishExceptions.IsEmpty) throw new AggregateException(publishExceptions);

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
