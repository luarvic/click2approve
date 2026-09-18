using Click2Approve.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore.Storage;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Commits once and discards tracked state when a transaction does not complete successfully.
/// </summary>
internal sealed class UnitOfWorkTransaction(ApiDbContext db, IDbContextTransaction transaction) : IUnitOfWorkTransaction
{
    private bool _committed;

    /// <inheritdoc />
    public async Task CommitAsync(CancellationToken cancellationToken = default)
    {
        await transaction.CommitAsync(cancellationToken);
        _committed = true;
    }

    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        try
        {
            await transaction.DisposeAsync();
        }
        finally
        {
            if (!_committed) db.ChangeTracker.Clear();
        }
    }
}
