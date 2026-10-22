using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.ApprovalRequests;

/// <summary>
/// Describes a resolved approval request recipient.
/// </summary>
public sealed record AssigneeResolution(
    AppUser AssigneeUser,
    long? AssigneeEmployeeId,
    long TenantId,
    string AssigneeDisplayName);
