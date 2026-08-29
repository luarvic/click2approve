using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for the in-app notification inbox.
/// </summary>
public class InAppNotificationRepository(ApiDbContext db) : IInAppNotificationRepository
{
    private readonly ApiDbContext _db = db;

    /// <inheritdoc />
    public async Task AddAsync(InAppNotification notification, CancellationToken cancellationToken) =>
        await _db.InAppNotifications.AddAsync(notification, cancellationToken);

    /// <inheritdoc />
    public Task<long> CountUnreadAsync(long userId, long tenantId, CancellationToken cancellationToken) =>
        _db.InAppNotifications.LongCountAsync(
            notification => notification.UserId == userId && notification.TenantId == tenantId && notification.ReadAt == null,
            cancellationToken);

    /// <inheritdoc />
    public Task<bool> ExistsAsync(Guid eventId, long userId, CancellationToken cancellationToken) =>
        _db.InAppNotifications.AnyAsync(
            notification => notification.EventId == eventId && notification.UserId == userId,
            cancellationToken);

    /// <inheritdoc />
    public Task<InAppNotification?> GetForReadAsync(
        long userId,
        long tenantId,
        Guid globalId,
        CancellationToken cancellationToken) =>
        _db.InAppNotifications.FirstOrDefaultAsync(
            notification => notification.GlobalId == globalId &&
                            notification.UserId == userId &&
                            notification.TenantId == tenantId,
            cancellationToken);

    /// <inheritdoc />
    public Task<List<InAppNotification>> ListAsync(
        long userId,
        long tenantId,
        bool unreadOnly,
        int skip,
        int take,
        CancellationToken cancellationToken)
    {
        var notifications = _db.InAppNotifications.AsNoTracking()
            .Where(notification => notification.UserId == userId && notification.TenantId == tenantId);
        if (unreadOnly) notifications = notifications.Where(notification => notification.ReadAt == null);
        return notifications
            .OrderByDescending(notification => notification.OccurredAt)
            .ThenByDescending(notification => notification.Id)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<List<InAppNotification>> ListForReadAsync(
        long userId,
        long tenantId,
        IReadOnlyCollection<Guid> globalIds,
        CancellationToken cancellationToken) =>
        _db.InAppNotifications
            .Where(notification => globalIds.Contains(notification.GlobalId) &&
                                   notification.UserId == userId &&
                                   notification.TenantId == tenantId)
            .ToListAsync(cancellationToken);

    /// <inheritdoc />
    public Task<List<InAppNotification>> ListUnreadForReadAsync(long userId, long tenantId, CancellationToken cancellationToken) =>
        _db.InAppNotifications
            .Where(notification => notification.UserId == userId &&
                                   notification.TenantId == tenantId &&
                                   notification.ReadAt == null)
            .ToListAsync(cancellationToken);

    /// <inheritdoc />
    public void RemoveRange(IReadOnlyCollection<InAppNotification> notifications) =>
        _db.InAppNotifications.RemoveRange(notifications);
}
