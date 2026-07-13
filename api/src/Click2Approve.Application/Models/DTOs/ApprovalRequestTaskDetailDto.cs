namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents the full task data required by an approval task editor.
/// </summary>
public class ApprovalRequestTaskDetailDto : ApprovalRequestTaskDto
{
    public ApprovalRequestDto? ApprovalRequest { get; init; }
}
