namespace Click2Approve.Application.Models.Results.Grids;

/// <summary>Contains one page of grid rows and the count before paging.</summary>
public sealed class GridPageResult<T>
{
    /// <summary>Rows in the requested page.</summary>
    public required List<T> Items { get; init; }

    /// <summary>Number of rows matching the query before paging.</summary>
    public required int TotalCount { get; init; }
}
