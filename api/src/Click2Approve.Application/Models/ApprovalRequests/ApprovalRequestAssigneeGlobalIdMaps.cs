namespace Click2Approve.Application.Models.ApprovalRequests;

/// <summary>
/// Contains public global ID lookup maps for approval request assignees.
/// </summary>
public sealed record ApprovalRequestAssigneeGlobalIdMaps(
    IReadOnlyDictionary<long, Guid> EmployeeGlobalIdsById,
    IReadOnlyDictionary<long, Guid> TeamGlobalIdsById)
{
    public static ApprovalRequestAssigneeGlobalIdMaps Empty { get; } = new(
        EmployeeGlobalIdsById: new Dictionary<long, Guid>(),
        TeamGlobalIdsById: new Dictionary<long, Guid>());
}
