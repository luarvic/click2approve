using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for user files.
/// </summary>
public class UserFileRepository(ApiDbContext db) : IUserFileRepository
{
    private readonly ApiDbContext _db = db;

    public async Task<UserFile> AddAsync(UserFile userFile, CancellationToken cancellationToken)
    {
        var entry = await _db.UserFiles.AddAsync(userFile, cancellationToken);
        return entry.Entity;
    }

    public Task<UserFile> GetForDownloadAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        return _db.UserFiles
            .Include(f => f.Owner)
            .FirstAsync(f => f.Id == id
                && (f.Owner == user || f.ApprovalRequests.Any(r => r.Tasks.Any(t => t.Approver == user.NormalizedEmail))),
                cancellationToken);
    }

    public Task<UserFile> GetForDeleteAsync(AppUser user, long id, CancellationToken cancellationToken)
    {
        return _db.UserFiles
            .Include(f => f.ApprovalRequests)
            .ThenInclude(r => r.Tasks)
            .FirstAsync(f => f.Id == id && f.Owner == user, cancellationToken);
    }

    public async Task<IList<UserFile>> ListByOwnerAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _db.UserFiles
            .Where(f => f.Owner == user)
            .ToListAsync(cancellationToken);
    }

    public Task<List<UserFile>> ListByOwnerAndIdsAsync(AppUser user, IReadOnlyCollection<long> ids, CancellationToken cancellationToken)
    {
        return _db.UserFiles
            .Where(f => ids.Contains(f.Id) && f.Owner == user)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountByOwnerAsync(AppUser user, CancellationToken cancellationToken)
    {
        return _db.UserFiles.CountAsync(f => f.Owner == user, cancellationToken);
    }

    public void Remove(UserFile userFile)
    {
        _db.UserFiles.Remove(userFile);
    }
}
