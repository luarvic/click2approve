using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Notifications;

/// <summary>
/// Contains reference-only data needed to persist a domain event.
/// </summary>
public record DomainEventCreate(
    DomainEventType Type,
    long TenantId,
    Guid EntityGlobalId,
    string Summary,
    IReadOnlyCollection<DomainEventRecipient> Recipients);

/// <summary>
/// Identifies one intended recipient and delivery channel for a domain event.
/// </summary>
public record DomainEventRecipient(long UserId, EventDeliveryChannel Channel);
