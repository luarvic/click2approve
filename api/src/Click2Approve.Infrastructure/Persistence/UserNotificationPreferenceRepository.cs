using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for user notification preferences.
/// </summary>
public class UserNotificationPreferenceRepository(ApiDbContext db) : IUserNotificationPreferenceRepository
{
    private readonly ApiDbContext _db = db;

    public async Task<UserNotificationPreference> AddAsync(UserNotificationPreference preference, CancellationToken cancellationToken)
    {
        var entry = await _db.UserNotificationPreferences.AddAsync(preference, cancellationToken);
        return entry.Entity;
    }

    public Task<UserNotificationPreference?> GetAsync(
        long userId,
        NotificationType type,
        NotificationChannel channel,
        CancellationToken cancellationToken)
    {
        return _db.UserNotificationPreferences
            .AsNoTracking()
            .FirstOrDefaultAsync(preference =>
                preference.UserId == userId
                && preference.Type == type
                && preference.Channel == channel,
                cancellationToken);
    }

    public Task<List<UserNotificationPreference>> ListAsync(long userId, CancellationToken cancellationToken)
    {
        return _db.UserNotificationPreferences
            .AsNoTracking()
            .Where(preference => preference.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public Task<List<UserNotificationPreference>> ListForUpdateAsync(long userId, CancellationToken cancellationToken)
    {
        return _db.UserNotificationPreferences
            .Where(preference => preference.UserId == userId)
            .ToListAsync(cancellationToken);
    }
}
