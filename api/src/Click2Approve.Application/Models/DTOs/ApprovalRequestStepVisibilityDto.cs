namespace Click2Approve.Application.Models.DTOs;

using Click2Approve.Domain.Models;

/// <summary>
/// Represents one assignee's visibility for a request step.
/// </summary>
public class ApprovalRequestStepVisibilityDto
{
    public required Guid AssigneeGlobalId { get; init; }
    public AssigneeType AssigneeType { get; init; }
    public string? AssigneeDisplayName { get; init; }
    public string? AssigneeEmail { get; init; }
    public Guid? AssigneeEmployeeGlobalId { get; init; }
    public Guid? AssigneeTeamGlobalId { get; init; }
    public required bool IsVisible { get; init; }
}
