using Click2Approve.Domain.Models;

namespace Click2Approve.WebApi.Models.Requests.ApprovalRequests;

/// <summary>Query-string contract for the Tasks list.</summary>
public sealed class ApprovalRequestTaskListQueryRequest
{
    /// <summary>Zero-based page number.</summary>
    public int Page { get; init; }

    /// <summary>Requested number of rows in the page.</summary>
    public int PageSize { get; init; } = 25;

    /// <summary>Supported sort field.</summary>
    public string? SortBy { get; init; }

    /// <summary>Sort direction.</summary>
    public string? SortDirection { get; init; }

    /// <summary>Optional task title fragment.</summary>
    public string? Title { get; init; }

    /// <summary>Optional requester name or email fragment.</summary>
    public string? RequestedBy { get; init; }

    /// <summary>Optional inclusive lower Created date boundary.</summary>
    public DateOnly? CreatedFrom { get; init; }

    /// <summary>Optional inclusive upper Created date boundary.</summary>
    public DateOnly? CreatedTo { get; init; }

    /// <summary>Task statuses to include. Repeat the <c>status</c> query parameter for multiple values.</summary>
    public List<ApprovalRequestTaskStatus> Status { get; init; } = [];
}
