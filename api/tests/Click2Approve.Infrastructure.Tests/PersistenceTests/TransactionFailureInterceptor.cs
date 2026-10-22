using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Click2Approve.Infrastructure.Tests.PersistenceTests;

/// <summary>Simulates a lost connection immediately before or after a transaction commits.</summary>
public sealed class TransactionFailureInterceptor : DbTransactionInterceptor
{
    public bool Armed { get; set; }
    public bool FailAfterCommit { get; set; }

    public override ValueTask<InterceptionResult> TransactionCommittingAsync(
        DbTransaction transaction, TransactionEventData eventData, InterceptionResult result,
        CancellationToken cancellationToken = default)
    {
        if (Armed && !FailAfterCommit)
        {
            Armed = false;
            throw new TimeoutException("Connection lost before commit.");
        }
        return ValueTask.FromResult(result);
    }

    public override Task TransactionCommittedAsync(
        DbTransaction transaction, TransactionEndEventData eventData,
        CancellationToken cancellationToken = default)
    {
        if (Armed && FailAfterCommit)
        {
            Armed = false;
            throw new TimeoutException("Commit succeeded, but its acknowledgement was lost.");
        }
        return Task.CompletedTask;
    }
}
