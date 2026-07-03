namespace Click2Approve.Application.Persistence;

/// <summary>
/// Commits pending persistence changes.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
