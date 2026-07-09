using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Models.DTOs;

/// <summary>
/// Represents a data transfer object required to complete an approval request task.
/// </summary>
public class ApprovalRequestTaskCompleteDto
{
    public required long Id { get; set; }
    public required ApprovalRequestTaskStatus Status { get; set; }
    public string? Comment { get; set; }
}
