namespace Click2Approve.Application.Models.DTOs;

using Click2Approve.Domain.Models;

/// <summary>
/// Represents one approver's visibility for a request step.
/// </summary>
public class ApprovalRequestStepVisibilityDto
{
    public required long ApproverId { get; init; }
    public ApprovalRecipientType ApproverType { get; init; }
    public string? ApproverDisplayName { get; init; }
    public string? ApproverEmail { get; init; }
    public long? ApproverEmployeeId { get; init; }
    public long? ApproverTeamId { get; init; }
    public required bool IsVisible { get; init; }
}
