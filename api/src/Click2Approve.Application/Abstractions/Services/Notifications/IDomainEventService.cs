using Click2Approve.Application.Models.Auxiliary;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.Notifications;

/// <summary>
/// Defines domain event creation and in-app delivery operations.
/// </summary>
public interface IDomainEventService
{
    Task CreateEventsAsync(IReadOnlyCollection<DomainEventCreate> events, CancellationToken cancellationToken);
    Task<long> CountInAppUnreadAsync(
        AppUser user,
        long tenantId,
        CancellationToken cancellationToken);
    Task<List<InAppNotificationDto>> ListInAppAsync(
        AppUser user,
        long tenantId,
        bool unreadOnly,
        int skip,
        int take,
        CancellationToken cancellationToken);
    Task MarkInAppReadAsync(
        AppUser user,
        long tenantId,
        Guid deliveryGlobalId,
        CancellationToken cancellationToken);
    Task MarkInAppReadAsync(
        AppUser user,
        long tenantId,
        IReadOnlyCollection<Guid> deliveryGlobalIds,
        CancellationToken cancellationToken);
    Task DeleteInAppAsync(
        AppUser user,
        long tenantId,
        IReadOnlyCollection<Guid> deliveryGlobalIds,
        CancellationToken cancellationToken);
    Task MarkAllInAppReadAsync(
        AppUser user,
        long tenantId,
        CancellationToken cancellationToken);
}
