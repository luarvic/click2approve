namespace click2approve.WebAPI.Models.DTOs;

// Represents a DTO required to complete an approval request task.
public class ApprovalRequestTaskCompleteDto
{
    public required long Id { get; set; }
    public required ApprovalStatus Status { get; set; }
    public string? Comment { get; set; }
}
