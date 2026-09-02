namespace Click2Approve.WebApi.Mappers.ApprovalRequests;

/// <summary>Maps the Requests list query contract to its application command.</summary>
public static class ApprovalRequestListQueryContractMapper
{
    /// <summary>Maps and validates a Requests list query.</summary>
    public static ApprovalRequestListQueryCommand Map(ApprovalRequestListQueryRequest request) => new()
    {
        Page = Math.Max(request.Page, 0),
        PageSize = Math.Clamp(request.PageSize, 1, 100),
        SortBy = ApprovalRequestListSortBy.CreatedAt,
        SortDirection = request.SortDirection?.Equals("asc", StringComparison.OrdinalIgnoreCase) == true
            ? ApprovalRequestListSortDirection.Asc
            : ApprovalRequestListSortDirection.Desc,
        Title = request.Title,
        RequestedBy = request.RequestedBy,
        CreatedFrom = request.CreatedFrom,
        CreatedTo = request.CreatedTo,
        Status = [.. request.Status.Distinct()]
    };
}
