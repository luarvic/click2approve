using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Commands.Notifications;

/// <summary>
/// Specifies the supported filters, sorting, and pagination for in-app notifications.
/// </summary>
public sealed class InAppNotificationListQueryCommand
{
    public int Page { get; init; }
    public int PageSize { get; init; } = 25;
    public InAppNotificationListSortDirection SortDirection { get; init; } = InAppNotificationListSortDirection.Desc;
    public IReadOnlyList<NotificationType> Type { get; init; } = [];
    public IReadOnlyList<InAppNotificationReadStatus> Status { get; init; } = [];
    public string? Details { get; init; }
    public DateOnly? ReceivedFrom { get; init; }
    public DateOnly? ReceivedTo { get; init; }
}

/// <summary>Read status filters available for in-app notifications.</summary>
public enum InAppNotificationReadStatus
{
    Read,
    Unread
}

/// <summary>Directions available for Received notification sorting.</summary>
public enum InAppNotificationListSortDirection
{
    Asc,
    Desc
}
