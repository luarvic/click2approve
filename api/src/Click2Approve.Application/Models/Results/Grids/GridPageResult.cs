namespace Click2Approve.Application.Models.Results.Grids;

/// <summary>Contains one page of grid rows and the count before paging.</summary>
public sealed class GridPageResult<T>
{
    public required List<T> Items { get; init; }
    public required int TotalCount { get; init; }
}
