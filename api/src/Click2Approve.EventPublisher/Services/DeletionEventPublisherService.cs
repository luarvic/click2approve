using System.Text.Json;
using Click2Approve.Application.Models.Events;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.EventPublisher.Services;

/// <summary>Schedules due user-file deletions through the durable event outbox.</summary>
public class DeletionEventPublisherService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger _logger;

    /// <summary>Creates the shared deletion publisher with its registered logger category.</summary>
    public DeletionEventPublisherService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<DeletionEventPublisherService> logger)
        : this(scopeFactory, configuration, (ILogger)logger)
    {
    }

    /// <summary>Allows edition-specific publishers to supply their own logger category.</summary>
    protected DeletionEventPublisherService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>Represents a scheduled domain object selected for deletion-event publication.</summary>
    protected sealed record DeletionCandidate(
        DeletionTargetType TargetType,
        Guid TargetGlobalId,
        Action<DateTime> MarkRequested);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var batchSize = Math.Max(1, _configuration.GetValue<int>("EventQueue:DeletionPublisher:BatchSize"));
        var idleDelay = TimeSpan.FromSeconds(Math.Max(1, _configuration.GetValue<int>("EventQueue:DeletionPublisher:IdleDelaySeconds")));
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (await ScheduleBatchAsync(batchSize, stoppingToken) == 0)
                    await Task.Delay(idleDelay, stoppingToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                // A competing scheduler claimed a candidate or a consumer already removed it.
                // SaveChanges rolled back this batch, including its outbox inserts.
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { return; }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Deletion event publication failed.");
                await Task.Delay(idleDelay, stoppingToken);
            }
        }
    }

    /// <summary>Commits the targets' scheduling markers and their deletion commands in one database save.</summary>
    public async Task<int> ScheduleBatchAsync(int batchSize, CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = GetDbContext(scope.ServiceProvider);
        var candidates = await ListCandidatesAsync(db, batchSize, cancellationToken);
        var now = DateTime.UtcNow;
        foreach (var candidate in candidates)
        {
            candidate.MarkRequested(now);
            db.EventOutboxMessages.Add(new EventOutboxMessage
            {
                EventId = Guid.NewGuid(),
                EventType = EventTypes.DeletionRequestedV1,
                OccurredAt = now,
                Payload = JsonSerializer.Serialize(
                    new DeletionRequestedPayload(candidate.TargetType, candidate.TargetGlobalId), EventJson.Options)
            });
        }
        if (candidates.Count > 0) await db.SaveChangesAsync(cancellationToken);
        return candidates.Count;
    }

    /// <summary>Selects due deletion candidates for the current product edition.</summary>
    protected virtual async Task<IReadOnlyCollection<DeletionCandidate>> ListCandidatesAsync(
        ApiDbContext db,
        int batchSize,
        CancellationToken cancellationToken)
    {
        var userFiles = await db.UserFiles
            .Where(file => file.ScheduledForDeletionAt <= DateTime.UtcNow && file.DeletionRequestedAt == null)
            .OrderBy(file => file.ScheduledForDeletionAt)
            .Take(batchSize)
            .ToListAsync(cancellationToken);
        return [.. userFiles.Select(file => new DeletionCandidate(
            DeletionTargetType.UserFile,
            file.GlobalId,
            requestedAt => file.DeletionRequestedAt = requestedAt))];
    }

    /// <summary>Resolves the persistence context used for deletion publication.</summary>
    protected virtual ApiDbContext GetDbContext(IServiceProvider serviceProvider) =>
        serviceProvider.GetRequiredService<ApiDbContext>();
}
