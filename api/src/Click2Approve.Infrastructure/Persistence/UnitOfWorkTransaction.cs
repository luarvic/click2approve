using Click2Approve.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore.Storage;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>Commits an EF transaction or rolls it back when disposed without a commit.</summary>
internal sealed class UnitOfWorkTransaction(IDbContextTransaction transaction) : IUnitOfWorkTransaction
{
    public Task CommitAsync(CancellationToken cancellationToken = default) => transaction.CommitAsync(cancellationToken);

    public ValueTask DisposeAsync() => transaction.DisposeAsync();
}
