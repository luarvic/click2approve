using Click2Approve.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.EventPublisher.Services;

/// <summary>Removes dispatched commands and events after their publication retention period.</summary>
public sealed class OutboxCleanupService(IServiceScopeFactory scopeFactory, IConfiguration configuration,
    ILogger<OutboxCleanupService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var batchSize = Math.Max(1, configuration.GetValue<int>("EventQueue:OutboxCleanup:BatchSize"));
        var interval = TimeSpan.FromSeconds(Math.Max(1, configuration.GetValue<int>("EventQueue:OutboxCleanup:IntervalSeconds")));
        var months = Math.Max(1, configuration.GetValue<int>("Retention:Defaults:EventOutboxMessageMonths"));
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
                var count = await DeleteBatchAsync(db, DateTime.UtcNow.AddMonths(-months), batchSize, stoppingToken);
                if (count == batchSize) continue;
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { return; }
            catch (Exception exception) { logger.LogError(exception, "Published outbox cleanup failed."); }
            await Task.Delay(interval, stoppingToken);
        }
    }

    public static Task<int> DeleteBatchAsync(ApiDbContext db, DateTime cutoff, int batchSize, CancellationToken cancellationToken) =>
        db.EventOutboxMessages.Where(message => message.PublishedAt <= cutoff)
            .OrderBy(message => message.PublishedAt).ThenBy(message => message.OccurredAt).ThenBy(message => message.Id)
            .Take(batchSize).ExecuteDeleteAsync(cancellationToken);
}
