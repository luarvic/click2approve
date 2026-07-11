namespace Click2Approve.Application.Models.DTOs;

using Click2Approve.Domain.Models;

/// <summary>
/// Represents a data transfer object required to submit an approval request approver.
/// </summary>
public class ApprovalRequestApproverSubmitDto
{
    public required ApprovalRecipientType Type { get; set; }
    public string? Email { get; set; }
    public long? EmployeeId { get; set; }
    public long? TeamId { get; set; }
    public string? DisplayName { get; set; }
    public bool CanViewRequest { get; set; }
}
