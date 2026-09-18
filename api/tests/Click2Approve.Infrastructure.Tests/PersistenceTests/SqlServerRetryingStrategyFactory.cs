using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Click2Approve.Infrastructure.Tests.PersistenceTests;

/// <summary>Exercises SQL Server retry and transaction rules against the relational test database.</summary>
public sealed class SqlServerRetryingStrategyFactory(ExecutionStrategyDependencies dependencies)
    : IExecutionStrategyFactory
{
    public IExecutionStrategy Create() =>
        new SqlServerRetryingExecutionStrategy(dependencies, maxRetryCount: 3, maxRetryDelay: TimeSpan.Zero,
            errorNumbersToAdd: null);
}
