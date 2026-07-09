namespace Click2Approve.Application.Models.DTOs;

using Click2Approve.Domain.Models;

/// <summary>
/// Represents a data transfer object required to update an approval request step.
/// </summary>
public class ApprovalRequestStepUpdateDto
{
    public long? Id { get; set; }
    public required int Sequence { get; set; }
    public required ApprovalStepMode Mode { get; set; }
    public required List<ApprovalRequestApproverUpdateDto> Approvers { get; set; }
}
