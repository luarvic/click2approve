using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents an approval workflow step returned with an approval request.
/// </summary>
public class ApprovalRequestStepDto
{
    public long Id { get; init; }
    public int Sequence { get; init; }
    public ApprovalStepMode Mode { get; init; }
    public required List<ApprovalRequestApproverDto> Approvers { get; init; }
    public required List<ApprovalRequestTaskDto> Tasks { get; init; }
}
