using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Commands.ApprovalRequests;

/// <summary>
/// Specifies the supported filters, sorting, and pagination for approval request summaries.
/// </summary>
public sealed class ApprovalRequestListQueryCommand
{
    /// <summary>Zero-based page number.</summary>
    public int Page { get; init; }

    /// <summary>Requested number of rows in the page.</summary>
    public int PageSize { get; init; } = 25;

    /// <summary>Field used to sort the results.</summary>
    public ApprovalRequestListSortBy SortBy { get; init; } = ApprovalRequestListSortBy.CreatedAt;

    /// <summary>Direction in which results are sorted.</summary>
    public ApprovalRequestListSortDirection SortDirection { get; init; } = ApprovalRequestListSortDirection.Desc;

    /// <summary>Optional request title fragment.</summary>
    public string? Title { get; init; }

    /// <summary>Optional requester name or email fragment.</summary>
    public string? RequestedBy { get; init; }

    /// <summary>Optional inclusive lower Created date boundary.</summary>
    public DateOnly? CreatedFrom { get; init; }

    /// <summary>Optional inclusive upper Created date boundary.</summary>
    public DateOnly? CreatedTo { get; init; }

    /// <summary>Request statuses to include.</summary>
    public IReadOnlyList<ApprovalRequestStatus> Status { get; init; } = [];
}

/// <summary>Fields available for sorting approval request summaries.</summary>
public enum ApprovalRequestListSortBy
{
    CreatedAt
}

/// <summary>Directions available for sorting approval request summaries.</summary>
public enum ApprovalRequestListSortDirection
{
    Asc,
    Desc
}
