using Click2Approve.Application.Abstractions.Auditing;
using Click2Approve.Domain.Models;
using Click2Approve.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Tests.PersistenceTests;

/// <summary>Verifies explicit commits, rollback, and the deliberate no-retry policy.</summary>
public sealed class UnitOfWorkTests
{
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task BeginTransactionAsync_PropagatesCommitFailureWithoutReplay(bool committed)
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        var interceptor = new TransactionFailureInterceptor { FailAfterCommit = committed };
        await using var db = CreateContext(connection, interceptor);
        await db.Database.EnsureCreatedAsync();
        interceptor.Armed = true;
        await Assert.ThrowsAsync<TimeoutException>(async () =>
        {
            await using var transaction = await db.BeginTransactionAsync();
            db.EventOutboxMessages.Add(CreateEvent());
            await db.SaveChangesAsync();
            await transaction.CommitAsync();
        });
        Assert.Equal(committed ? 1 : 0, await db.EventOutboxMessages.CountAsync());
        Assert.Empty(db.ChangeTracker.Entries());
        Assert.Null(db.Database.CurrentTransaction);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task BeginTransactionAsync_CommitsOnlyWhenExplicitlyRequested(bool commit)
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using var db = CreateContext(connection);
        await db.Database.EnsureCreatedAsync();
        await using (var transaction = await db.BeginTransactionAsync())
        {
            db.EventOutboxMessages.Add(CreateEvent());
            await db.SaveChangesAsync();
            db.EventOutboxMessages.Add(CreateEvent());
            await db.SaveChangesAsync();
            if (commit) await transaction.CommitAsync();
        }
        Assert.Equal(commit ? 2 : 0, await db.EventOutboxMessages.CountAsync());
        Assert.Null(db.Database.CurrentTransaction);
        if (!commit) Assert.Empty(db.ChangeTracker.Entries());
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task SaveChangesAsync_AuditAndDataRemainAtomicOnCommitFailure(bool committed)
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        var interceptor = new TransactionFailureInterceptor { FailAfterCommit = committed };
        await using var db = CreateContext(connection, interceptor, audit: true);
        await db.Database.EnsureCreatedAsync();
        db.Add(new Tenant
        {
            Owner = new AppUser { Email = "owner@example.com" },
            Type = TenantType.Personal,
            SubscriptionPlan = SubscriptionPlan.PersonalFree,
            BusinessName = "Tenant"
        });
        interceptor.Armed = true;
        await Assert.ThrowsAsync<TimeoutException>(() => db.SaveChangesAsync());
        Assert.Equal(committed ? 1 : 0, await db.Tenants.CountAsync());
        Assert.Equal(committed ? 1 : 0, await db.Users.CountAsync());
        Assert.Equal(committed ? 1 : 0, await db.AuditLogs.CountAsync());
        Assert.Empty(db.ChangeTracker.Entries());
        Assert.Null(db.Database.CurrentTransaction);
    }

    [Fact]
    public async Task ConfiguredRetries_AreDeliberatelyDisabledForAllOperations()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using var db = CreateContext(connection);
        await db.Database.EnsureCreatedAsync();
        var strategy = db.Database.CreateExecutionStrategy();
        Assert.False(strategy.RetriesOnFailure);
        var attempts = 0;
        await Assert.ThrowsAsync<TimeoutException>(() => strategy.ExecuteAsync<object?, bool>(null, (_, _, _) =>
        {
            attempts++;
            throw new TimeoutException("Transient failure.");
        }, verifySucceeded: null));
        Assert.Equal(1, attempts);
        await using var transaction = await db.BeginTransactionAsync();
        Assert.False(db.Database.CreateExecutionStrategy().RetriesOnFailure);
    }

    [Fact]
    public void AzureSql_DefaultRetriesAreDisabled()
    {
        var options = new DbContextOptionsBuilder<ApiDbContext>()
            .UseAzureSql("Server=localhost;Database=Unused;Integrated Security=true;TrustServerCertificate=true").Options;
        using var db = new ApiDbContext(options, new DisabledAuditContext());
        Assert.False(db.Database.CreateExecutionStrategy().RetriesOnFailure);
    }

    private static ApiDbContext CreateContext(SqliteConnection connection,
        TransactionFailureInterceptor? interceptor = null, bool audit = false)
    {
        var builder = new DbContextOptionsBuilder<ApiDbContext>().UseSqlite(connection,
            sql => sql.ExecutionStrategy(dependencies => new SqlServerRetryingStrategyFactory(dependencies).Create()));
        if (interceptor is not null) builder.AddInterceptors(interceptor);
        return new ApiDbContext(builder.Options, audit ? new EnabledAuditContext() : new DisabledAuditContext());
    }

    private static EventOutboxMessage CreateEvent() => new()
    {
        EventId = Guid.NewGuid(),
        EventType = "test.event.v1",
        OccurredAt = DateTime.UtcNow,
        Payload = "{}"
    };

    private sealed class EnabledAuditContext : IAuditContext
    {
        public bool IsEnabled => true;
        public long? UserId => null;
    }
}
