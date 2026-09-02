using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Commands.ApprovalRequests;

/// <summary>
/// Specifies the supported filters, sorting, and pagination for approval request task summaries.
/// </summary>
public sealed class ApprovalRequestTaskListQueryCommand
{
    /// <summary>Zero-based page number.</summary>
    public int Page { get; init; }

    /// <summary>Requested number of rows in the page.</summary>
    public int PageSize { get; init; } = 25;

    /// <summary>Field used to sort the results.</summary>
    public ApprovalRequestTaskListSortBy SortBy { get; init; } = ApprovalRequestTaskListSortBy.CreatedAt;

    /// <summary>Direction in which results are sorted.</summary>
    public ApprovalRequestTaskListSortDirection SortDirection { get; init; } = ApprovalRequestTaskListSortDirection.Desc;

    /// <summary>Optional task title fragment.</summary>
    public string? Title { get; init; }

    /// <summary>Optional requester name or email fragment.</summary>
    public string? RequestedBy { get; init; }

    /// <summary>Optional inclusive lower Created date boundary.</summary>
    public DateOnly? CreatedFrom { get; init; }

    /// <summary>Optional inclusive upper Created date boundary.</summary>
    public DateOnly? CreatedTo { get; init; }

    /// <summary>Task statuses to include.</summary>
    public IReadOnlyList<ApprovalRequestTaskStatus> Status { get; init; } = [];
}

/// <summary>Fields available for sorting approval request task summaries.</summary>
public enum ApprovalRequestTaskListSortBy
{
    CreatedAt
}

/// <summary>Directions available for sorting approval request task summaries.</summary>
public enum ApprovalRequestTaskListSortDirection
{
    Asc,
    Desc
}
