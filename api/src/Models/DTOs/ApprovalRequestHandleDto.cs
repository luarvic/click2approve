namespace api.Models.DTOs;

// Represents a DTO required to approve or reject an approval request.
public class ApprovalRequestHandleDto
{
    public required long Id { get; set; }
    public required ApprovalRequestStatuses Status { get; set; }
    public string? Comment { get; set; }
}
