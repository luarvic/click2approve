using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Persistence;

/// <summary>
/// Defines persistence operations for the durable in-app notification inbox.
/// </summary>
public interface IInAppNotificationRepository
{
    Task AddAsync(InAppNotification notification, CancellationToken cancellationToken);
    Task<long> CountUnreadAsync(long userId, long tenantId, CancellationToken cancellationToken);
    Task<bool> ExistsAsync(Guid eventId, long userId, CancellationToken cancellationToken);
    Task<InAppNotification?> GetForReadAsync(long userId, long tenantId, Guid globalId, CancellationToken cancellationToken);
    Task<List<InAppNotification>> ListAsync(
        long userId,
        long tenantId,
        bool unreadOnly,
        int skip,
        int take,
        CancellationToken cancellationToken);
    Task<List<InAppNotification>> ListForReadAsync(
        long userId,
        long tenantId,
        IReadOnlyCollection<Guid> globalIds,
        CancellationToken cancellationToken);
    Task<List<InAppNotification>> ListUnreadForReadAsync(long userId, long tenantId, CancellationToken cancellationToken);
    void RemoveRange(IReadOnlyCollection<InAppNotification> notifications);
}
