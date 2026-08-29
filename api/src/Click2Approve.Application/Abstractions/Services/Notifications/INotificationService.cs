using Click2Approve.Application.Models.Commands.Notifications;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.Notifications;

/// <summary>
/// Sends notifications and manages the authenticated user's in-app notification inbox.
/// </summary>
public interface INotificationService
{
    Task SendAsync(IReadOnlyCollection<NotificationCommand> notifications, CancellationToken cancellationToken);
    Task<long> CountInAppUnreadAsync(AppUser user, long tenantId, CancellationToken cancellationToken);
    Task<List<InAppNotificationResult>> ListInAppAsync(
        AppUser user,
        long tenantId,
        bool unreadOnly,
        int skip,
        int take,
        CancellationToken cancellationToken);
    Task MarkInAppReadAsync(AppUser user, long tenantId, Guid notificationGlobalId, CancellationToken cancellationToken);
    Task MarkInAppReadAsync(
        AppUser user,
        long tenantId,
        IReadOnlyCollection<Guid> notificationGlobalIds,
        CancellationToken cancellationToken);
    Task DeleteInAppAsync(
        AppUser user,
        long tenantId,
        IReadOnlyCollection<Guid> notificationGlobalIds,
        CancellationToken cancellationToken);
    Task MarkAllInAppReadAsync(AppUser user, long tenantId, CancellationToken cancellationToken);
}
