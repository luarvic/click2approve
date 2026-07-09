namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents a data transfer object required to update an approval request approver.
/// </summary>
public class ApprovalRequestApproverUpdateDto : ApprovalRequestApproverSubmitDto
{
    public long? Id { get; set; }
}
