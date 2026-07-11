using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approver returned with an approval request step.
/// </summary>
public class ApprovalRequestApproverDto
{
    public long Id { get; init; }
    public ApprovalRecipientType Type { get; init; }
    public string? Email { get; init; }
    public long? EmployeeId { get; init; }
    public long? TeamId { get; init; }
    public string? DisplayName { get; init; }
    public bool CanViewRequest { get; init; }
}
