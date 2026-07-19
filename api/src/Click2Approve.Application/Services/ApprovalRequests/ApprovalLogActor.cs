using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Represents the actor recorded on approval request and task log entries.
/// </summary>
public sealed record ApprovalLogActor(
    ApprovalLogActorType Type,
    string? UserId,
    long? EmployeeId,
    string Email,
    string? DisplayName);
