using System.Diagnostics.CodeAnalysis;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents the full task data required by an approval task editor.
/// </summary>
public class ApprovalRequestTaskDetailDto : ApprovalRequestTaskDto
{
    public ApprovalRequestTaskDetailDto()
    {
    }

    [SetsRequiredMembers]
    public ApprovalRequestTaskDetailDto(ApprovalRequestTaskDto source) : base(source)
    {
        UserFiles = [];
    }

    public required List<UserFileDto> UserFiles { get; init; }
    public ApprovalRequestDto? ApprovalRequest { get; init; }
}
