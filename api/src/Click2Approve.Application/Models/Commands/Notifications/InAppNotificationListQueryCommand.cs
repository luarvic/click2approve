using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Commands.Notifications;

/// <summary>
/// Specifies the supported filters, sorting, and pagination for in-app notifications.
/// </summary>
public sealed class InAppNotificationListQueryCommand
{
    /// <summary>Zero-based page number.</summary>
    public int Page { get; init; }

    /// <summary>Requested number of rows in the page.</summary>
    public int PageSize { get; init; } = 25;

    /// <summary>Direction in which Received results are sorted.</summary>
    public InAppNotificationListSortDirection SortDirection { get; init; } = InAppNotificationListSortDirection.Desc;

    /// <summary>Notification types to include.</summary>
    public IReadOnlyList<NotificationType> Type { get; init; } = [];

    /// <summary>Read statuses to include.</summary>
    public IReadOnlyList<InAppNotificationReadStatus> Status { get; init; } = [];

    /// <summary>Optional notification details fragment.</summary>
    public string? Details { get; init; }

    /// <summary>Optional inclusive lower Received date boundary.</summary>
    public DateOnly? ReceivedFrom { get; init; }

    /// <summary>Optional inclusive upper Received date boundary.</summary>
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
