using Microsoft.EntityFrameworkCore.Storage;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>Applies the deliberate no-retry policy to all operations in the shared and commercial contexts.</summary>
public sealed class NonRetryingExecutionStrategyFactory(ExecutionStrategyDependencies dependencies)
    : IExecutionStrategyFactory
{
    /// <inheritdoc />
    public IExecutionStrategy Create() => new NonRetryingExecutionStrategy(dependencies);
}
