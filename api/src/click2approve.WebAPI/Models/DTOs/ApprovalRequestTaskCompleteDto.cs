namespace click2approve.WebAPI.Models.DTOs;

/// <summary>
/// Represents a data transfer object required to complete an approval request task.
/// </summary>
public class ApprovalRequestTaskCompleteDto
{
    public required long Id { get; set; }
    public required ApprovalStatus Status { get; set; }
    public string? Comment { get; set; }
}
