using Click2Approve.Application.Models.Results.UserFiles;
using Click2Approve.WebApi.Models.Responses.UserFiles;

namespace Click2Approve.WebApi.Mappers.UserFiles;

/// <summary>
/// Maps user-file application results to HTTP responses.
/// </summary>
internal static class UserFileResponseMapper
{
    public static UserFileResponse Map(UserFileResult result) => new()
    {
        CreatedAt = result.CreatedAt,
        GlobalId = result.GlobalId,
        Name = result.Name,
        Size = result.Size,
        Type = result.Type
    };

    public static List<UserFileResponse> Map(IEnumerable<UserFileResult> results) => [.. results.Select(Map)];
}
