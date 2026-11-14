using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Commands.ApprovalRequests;

/// <summary>
/// Specifies the supported filters, sorting, and pagination for approval request summaries.
/// </summary>
public sealed class ApprovalRequestListQueryCommand
{
    public int Page { get; init; }
    public int PageSize { get; init; } = 25;
    public ApprovalRequestListSortBy SortBy { get; init; } = ApprovalRequestListSortBy.CreatedAt;
    public ApprovalRequestListSortDirection SortDirection { get; init; } = ApprovalRequestListSortDirection.Desc;
    public string? Title { get; init; }
    public string? RequestedBy { get; init; }
    public DateOnly? CreatedFrom { get; init; }
    public DateOnly? CreatedTo { get; init; }
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
