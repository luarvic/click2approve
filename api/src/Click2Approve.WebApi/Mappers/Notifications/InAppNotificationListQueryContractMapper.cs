using Click2Approve.Application.Models.Commands.Notifications;

namespace Click2Approve.WebApi.Mappers.Notifications;

/// <summary>Maps the Notifications list query contract to its application command.</summary>
public static class InAppNotificationListQueryContractMapper
{
    /// <summary>Maps and validates a Notifications list query.</summary>
    public static InAppNotificationListQueryCommand Map(InAppNotificationListQueryRequest request) => new()
    {
        Page = Math.Max(request.Page, 0),
        PageSize = Math.Clamp(request.PageSize, 1, 100),
        SortDirection = request.SortDirection?.Equals("asc", StringComparison.OrdinalIgnoreCase) == true
            ? InAppNotificationListSortDirection.Asc
            : InAppNotificationListSortDirection.Desc,
        Type = [.. request.Type.Distinct()],
        Status = [.. request.Status.Distinct()],
        Details = request.Details,
        ReceivedFrom = request.ReceivedFrom,
        ReceivedTo = request.ReceivedTo
    };
}
