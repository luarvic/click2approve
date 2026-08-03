using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approver returned with an approval request step.
/// </summary>
public class ApprovalRequestApproverDto
{
    public Guid GlobalId { get; init; }
    public ApprovalRecipientType Type { get; init; }
    public string? Email { get; init; }
    public Guid? EmployeeGlobalId { get; init; }
    public Guid? TeamGlobalId { get; init; }
    public string? DisplayName { get; init; }
}
