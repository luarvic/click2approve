using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.Commands.ApprovalRequests;

/// <summary>
/// Specifies the supported filters, sorting, and pagination for approval request task summaries.
/// </summary>
public sealed class ApprovalRequestTaskListQueryCommand
{
    public int Page { get; init; }
    public int PageSize { get; init; } = 25;
    public ApprovalRequestTaskListSortBy SortBy { get; init; } = ApprovalRequestTaskListSortBy.CreatedAt;
    public ApprovalRequestTaskListSortDirection SortDirection { get; init; } = ApprovalRequestTaskListSortDirection.Desc;
    public string? Title { get; init; }
    public string? RequestedBy { get; init; }
    public DateOnly? CreatedFrom { get; init; }
    public DateOnly? CreatedTo { get; init; }
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
