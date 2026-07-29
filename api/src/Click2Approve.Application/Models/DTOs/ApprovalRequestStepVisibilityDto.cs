namespace Click2Approve.Application.Models.DTOs;

using Click2Approve.Domain.Models;

/// <summary>
/// Represents one approver's visibility for a request step.
/// </summary>
public class ApprovalRequestStepVisibilityDto
{
    public required Guid ApproverGlobalId { get; init; }
    public ApprovalRecipientType ApproverType { get; init; }
    public string? ApproverDisplayName { get; init; }
    public string? ApproverEmail { get; init; }
    public Guid? ApproverEmployeeGlobalId { get; init; }
    public Guid? ApproverTeamGlobalId { get; init; }
    public required bool IsVisible { get; init; }
}
