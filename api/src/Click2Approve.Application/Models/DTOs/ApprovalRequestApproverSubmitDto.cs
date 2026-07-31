namespace Click2Approve.Application.Models.DTOs;

using Click2Approve.Domain.Models;

/// <summary>
/// Represents a data transfer object required to submit an approval request approver.
/// </summary>
public class ApprovalRequestApproverSubmitDto
{
    public required ApprovalRecipientType Type { get; set; }
    public string? Email { get; set; }
    public Guid? EmployeeGlobalId { get; set; }
    public Guid? TeamGlobalId { get; set; }
    public bool RequiresIdentityVerification { get; set; }
}
