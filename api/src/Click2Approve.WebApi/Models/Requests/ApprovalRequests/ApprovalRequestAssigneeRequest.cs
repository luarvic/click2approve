namespace Click2Approve.WebApi.Models.Requests.ApprovalRequests;

using Click2Approve.Domain.Models;

/// <summary>
/// Represents a data transfer object required to submit an approval request assignee.
/// </summary>
public class ApprovalRequestAssigneeRequest
{
    /// <summary>Type of assignee.</summary>
    public required AssigneeType Type { get; set; }
    /// <summary>Whether the assignee must sign in to an account to respond.</summary>
    public bool AccountSignInRequired { get; set; } = true;
    /// <summary>Email address.</summary>
    public string? Email { get; set; }
    /// <summary>Global identifier of the user.</summary>
    public Guid? UserGlobalId { get; set; }
    /// <summary>Global identifier of the employee.</summary>
    public Guid? EmployeeGlobalId { get; set; }
    /// <summary>Global identifier of the assigned team.</summary>
    public Guid? TeamGlobalId { get; set; }
}
