using Click2Approve.Application.Models.Commands.Notifications;
using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Requests.Notifications;

/// <summary>Query-string contract for the Notifications list.</summary>
public sealed class InAppNotificationListQueryRequest
{
    /// <summary>Zero-based page number.</summary>
    public int Page { get; init; }

    /// <summary>Requested number of rows in the page.</summary>
    public int PageSize { get; init; } = 25;

    /// <summary>Sort direction for the Received column.</summary>
    public string? SortDirection { get; init; }

    /// <summary>Notification types to include. Repeat the <c>type</c> query parameter for multiple values.</summary>
    public List<NotificationType> Type { get; init; } = [];

    /// <summary>Read statuses to include. Repeat the <c>status</c> query parameter for multiple values.</summary>
    public List<InAppNotificationReadStatus> Status { get; init; } = [];

    /// <summary>Optional notification details fragment.</summary>
    public string? Details { get; init; }

    /// <summary>Optional inclusive lower Received date boundary.</summary>
    public DateOnly? ReceivedFrom { get; init; }

    /// <summary>Optional inclusive upper Received date boundary.</summary>
    public DateOnly? ReceivedTo { get; init; }
}
