using Click2Approve.Application.Models.Results.Grids;
using Click2Approve.WebApi.Models.Responses.Grids;

namespace Click2Approve.WebApi.Mappers.Grids;

/// <summary>Maps application grid pages to HTTP responses.</summary>
public static class GridPageResponseMapper
{
    /// <summary>Maps an application page to an HTTP response.</summary>
    public static GridPageResponse<TResponse> Map<TItem, TResponse>(GridPageResult<TItem> page, Func<TItem, TResponse> map) => new()
    {
        Items = [.. page.Items.Select(map)],
        TotalCount = page.TotalCount
    };
}
