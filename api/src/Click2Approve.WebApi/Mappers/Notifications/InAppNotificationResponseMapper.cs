using Click2Approve.Application.Models.Results.Notifications;
using Click2Approve.WebApi.Models.Responses.Notifications;

namespace Click2Approve.WebApi.Mappers.Notifications;

/// <summary>
/// Maps in-app-notification application results to HTTP responses.
/// </summary>
internal static class InAppNotificationResponseMapper
{
    public static InAppNotificationResponse Map(InAppNotificationResult result) => new()
    {
        EntityGlobalId = result.EntityGlobalId,
        GlobalId = result.GlobalId,
        OccurredAt = result.OccurredAt,
        ReadAt = result.ReadAt,
        Summary = result.Summary,
        Type = result.Type
    };

    public static List<InAppNotificationResponse> Map(IEnumerable<InAppNotificationResult> results) => [.. results.Select(Map)];
}
