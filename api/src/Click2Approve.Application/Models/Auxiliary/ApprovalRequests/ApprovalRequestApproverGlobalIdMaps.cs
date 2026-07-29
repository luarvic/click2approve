namespace Click2Approve.Application.Models.Auxiliary.ApprovalRequests;

/// <summary>
/// Contains public global ID lookup maps for approval request approvers.
/// </summary>
public sealed record ApprovalRequestApproverGlobalIdMaps(
    IReadOnlyDictionary<long, Guid> EmployeeGlobalIdsById,
    IReadOnlyDictionary<long, Guid> TeamGlobalIdsById)
{
    public static ApprovalRequestApproverGlobalIdMaps Empty { get; } = new(
        EmployeeGlobalIdsById: new Dictionary<long, Guid>(),
        TeamGlobalIdsById: new Dictionary<long, Guid>());
}
