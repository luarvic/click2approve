using Click2Approve.Application.Abstractions.Persistence;
using Click2Approve.Application.Models.Commands.Notifications;
using Click2Approve.Application.Models.Results.Grids;
using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>
/// Provides EF Core persistence operations for the in-app notification inbox.
/// </summary>
public class InAppNotificationRepository(ApiDbContext db) : IInAppNotificationRepository
{
    private readonly ApiDbContext _db = db;

    public async Task AddAsync(InAppNotification notification, CancellationToken cancellationToken) =>
        await _db.InAppNotifications.AddAsync(notification, cancellationToken);

    public Task<long> CountUnreadAsync(long userId, long tenantId, CancellationToken cancellationToken) =>
        _db.InAppNotifications.LongCountAsync(
            notification => notification.UserId == userId && notification.TenantId == tenantId && notification.ReadAt == null,
            cancellationToken);

    public Task<bool> ExistsAsync(Guid eventId, long userId, CancellationToken cancellationToken) =>
        _db.InAppNotifications.AnyAsync(
            notification => notification.EventId == eventId && notification.UserId == userId,
            cancellationToken);

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

    public async Task<GridPageResult<InAppNotification>> ListAsync(
        long userId,
        long tenantId,
        InAppNotificationListQueryCommand query,
        CancellationToken cancellationToken)
    {
        var notifications = _db.InAppNotifications.AsNoTracking()
            .Where(notification => notification.UserId == userId && notification.TenantId == tenantId);
        if (query.Type.Count > 0) notifications = notifications.Where(notification => query.Type.Contains(notification.Type));
        if (query.Status.Count == 1)
        {
            notifications = query.Status[0] == InAppNotificationReadStatus.Read
                ? notifications.Where(notification => notification.ReadAt != null)
                : notifications.Where(notification => notification.ReadAt == null);
        }
        if (!string.IsNullOrWhiteSpace(query.Details))
        {
            notifications = notifications.Where(notification => notification.Summary.Contains(query.Details));
        }
        if (query.ReceivedFrom.HasValue)
        {
            var receivedFromUtc = DateTime.SpecifyKind(
                query.ReceivedFrom.Value.ToDateTime(TimeOnly.MinValue),
                DateTimeKind.Utc);
            notifications = notifications.Where(notification => notification.OccurredAt >= receivedFromUtc);
        }
        if (query.ReceivedTo.HasValue)
        {
            var exclusiveReceivedToUtc = DateTime.SpecifyKind(
                query.ReceivedTo.Value.AddDays(1).ToDateTime(TimeOnly.MinValue),
                DateTimeKind.Utc);
            notifications = notifications.Where(notification => notification.OccurredAt < exclusiveReceivedToUtc);
        }

        var totalCount = await notifications.CountAsync(cancellationToken);
        var ordered = query.SortDirection switch
        {
            InAppNotificationListSortDirection.Asc => notifications.OrderBy(notification => notification.OccurredAt)
                .ThenBy(notification => notification.GlobalId),
            _ => notifications.OrderByDescending(notification => notification.OccurredAt)
                .ThenBy(notification => notification.GlobalId)
        };
        var items = await ordered
            .Skip(query.Page * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);
        return new GridPageResult<InAppNotification> { Items = items, TotalCount = totalCount };
    }

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

    public Task<List<InAppNotification>> ListUnreadForReadAsync(long userId, long tenantId, CancellationToken cancellationToken) =>
        _db.InAppNotifications
            .Where(notification => notification.UserId == userId &&
                                   notification.TenantId == tenantId &&
                                   notification.ReadAt == null)
            .ToListAsync(cancellationToken);

    public void RemoveRange(IReadOnlyCollection<InAppNotification> notifications) =>
        _db.InAppNotifications.RemoveRange(notifications);
}
