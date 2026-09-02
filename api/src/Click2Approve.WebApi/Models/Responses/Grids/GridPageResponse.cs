namespace Click2Approve.WebApi.Models.Responses.Grids;

/// <summary>HTTP response containing one data-grid page.</summary>
public sealed class GridPageResponse<T>
{
    /// <summary>Rows in the requested page.</summary>
    public required List<T> Items { get; init; }

    /// <summary>Number of rows matching the query before paging.</summary>
    public required int TotalCount { get; init; }
}
