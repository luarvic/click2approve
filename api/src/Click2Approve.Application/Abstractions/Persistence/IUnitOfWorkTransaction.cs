namespace Click2Approve.Application.Abstractions.Persistence;

/// <summary>Groups persistence changes, including intermediate saves, into one atomic operation.</summary>
public interface IUnitOfWorkTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken = default);
}
