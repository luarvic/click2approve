using System.Text.Json;
using Click2Approve.Application.Abstractions.Events;
using Click2Approve.Application.Models.Events;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.EventPublisher.Services;

/// <summary>Publishes low-priority requests for permanently deleting due user files.</summary>
public class DeletionEventPublisherService(
    IEventQueue eventQueue,
    IEventPriorityResolver eventPriorityResolver,
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger logger) : BackgroundService
{
    private readonly IEventQueue _eventQueue = eventQueue;
    private readonly IEventPriorityResolver _eventPriorityResolver = eventPriorityResolver;
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger _logger = logger;

    /// <summary>Represents a scheduled domain object selected for deletion-event publication.</summary>
    protected sealed record DeletionCandidate(
        DeletionTargetType TargetType,
        Guid TargetGlobalId,
        Action<DateTime> MarkPublished);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var batchSize = Math.Max(1, _configuration.GetValue<int>("EventQueue:DeletionPublisher:BatchSize"));
        var idleDelay = TimeSpan.FromSeconds(Math.Max(1, _configuration.GetValue<int>("EventQueue:DeletionPublisher:IdleDelaySeconds")));
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = GetDbContext(scope.ServiceProvider);
                var candidates = await ListCandidatesAsync(db, batchSize, stoppingToken);
                foreach (var candidate in candidates)
                {
                    await _eventQueue.EnqueueAsync(
                        _eventPriorityResolver.Resolve(EventTypes.DeletionRequestedV1),
                        new EventEnvelope(
                            Guid.NewGuid(),
                            EventTypes.DeletionRequestedV1,
                            DateTime.UtcNow,
                            JsonSerializer.Serialize(
                                new DeletionRequestedPayload(candidate.TargetType, candidate.TargetGlobalId),
                                EventJson.Options)),
                        stoppingToken);
                    candidate.MarkPublished(DateTime.UtcNow);
                }

                if (candidates.Count > 0) await db.SaveChangesAsync(stoppingToken);
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

    /// <summary>Selects due deletion candidates for the current product edition.</summary>
    protected virtual async Task<IReadOnlyCollection<DeletionCandidate>> ListCandidatesAsync(
        ApiDbContext db,
        int batchSize,
        CancellationToken cancellationToken)
    {
        var userFiles = await db.UserFiles
            .Where(file => file.ScheduledForDeletionAt <= DateTime.UtcNow && file.DeletionPublishedAt == null)
            .OrderBy(file => file.ScheduledForDeletionAt)
            .Take(batchSize)
            .ToListAsync(cancellationToken);
        return [.. userFiles.Select(file => new DeletionCandidate(
            DeletionTargetType.UserFile,
            file.GlobalId,
            publishedAt => file.DeletionPublishedAt = publishedAt))];
    }

    /// <summary>Resolves the persistence context used for deletion publication.</summary>
    protected virtual ApiDbContext GetDbContext(IServiceProvider serviceProvider) =>
        serviceProvider.GetRequiredService<ApiDbContext>();
}
