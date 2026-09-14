using System.Text.Json;
using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.EventPublisher.Services;

/// <summary>Publishes low-priority requests for permanently deleting due user files.</summary>
public sealed class DeletionEventPublisherService(
    IEventQueue eventQueue,
    IEventPriorityResolver eventPriorityResolver,
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<DeletionEventPublisherService> logger) : BackgroundService
{
    private readonly IEventQueue _eventQueue = eventQueue;
    private readonly IEventPriorityResolver _eventPriorityResolver = eventPriorityResolver;
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger<DeletionEventPublisherService> _logger = logger;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var batchSize = Math.Max(1, _configuration.GetValue<int>("EventQueue:DeletionPublisher:BatchSize"));
        var idleDelay = TimeSpan.FromSeconds(Math.Max(1, _configuration.GetValue<int>("EventQueue:DeletionPublisher:IdleDelaySeconds")));
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
                var userFiles = await db.UserFiles
                    .Where(file => file.ScheduledForDeletionAt <= DateTime.UtcNow && file.DeletionPublishedAt == null)
                    .OrderBy(file => file.ScheduledForDeletionAt)
                    .Take(batchSize)
                    .ToListAsync(stoppingToken);

                foreach (var userFile in userFiles)
                {
                    await _eventQueue.EnqueueAsync(
                        _eventPriorityResolver.Resolve(EventTypes.DeletionRequestedV1),
                        new EventEnvelope(
                            Guid.NewGuid(),
                            EventTypes.DeletionRequestedV1,
                            DateTime.UtcNow,
                            JsonSerializer.Serialize(
                                new DeletionRequestedPayload(DeletionTargetType.UserFile, userFile.GlobalId),
                                EventJson.Options)),
                        stoppingToken);
                    userFile.DeletionPublishedAt = DateTime.UtcNow;
                }

                if (userFiles.Count > 0) await db.SaveChangesAsync(stoppingToken);
                else await Task.Delay(idleDelay, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { return; }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Deletion event publication failed.");
                await Task.Delay(idleDelay, stoppingToken);
            }
        }
    }
}
