namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents the currently mutable properties of an existing approval request.
/// </summary>
public class ApprovalRequestUpdateDto
{
    public required List<ApprovalRequestStepUpdateDto> Steps { get; set; }
}
