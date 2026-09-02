namespace Click2Approve.WebApi.Mappers.ApprovalRequests;

/// <summary>Maps the Tasks list query contract to its application command.</summary>
public static class ApprovalRequestTaskListQueryContractMapper
{
    /// <summary>Maps and validates a Tasks list query.</summary>
    public static ApprovalRequestTaskListQueryCommand Map(ApprovalRequestTaskListQueryRequest request) => new()
    {
        Page = Math.Max(request.Page, 0),
        PageSize = Math.Clamp(request.PageSize, 1, 100),
        SortBy = ApprovalRequestTaskListSortBy.CreatedAt,
        SortDirection = request.SortDirection?.Equals("asc", StringComparison.OrdinalIgnoreCase) == true
            ? ApprovalRequestTaskListSortDirection.Asc
            : ApprovalRequestTaskListSortDirection.Desc,
        Title = request.Title,
        RequestedBy = request.RequestedBy,
        CreatedFrom = request.CreatedFrom,
        CreatedTo = request.CreatedTo,
        Status = [.. request.Status.Distinct()]
    };
}
