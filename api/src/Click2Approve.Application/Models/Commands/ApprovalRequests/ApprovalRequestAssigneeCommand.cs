namespace Click2Approve.Application.Models.Commands.ApprovalRequests;

using Click2Approve.Domain.Models;

/// <summary>
/// Represents a data transfer object required to submit an approval request assignee.
/// </summary>
public class ApprovalRequestAssigneeCommand
{
    public required AssigneeType Type { get; set; }
    public string? Email { get; set; }
    public Guid? UserGlobalId { get; set; }
    public Guid? EmployeeGlobalId { get; set; }
    public Guid? TeamGlobalId { get; set; }
}
