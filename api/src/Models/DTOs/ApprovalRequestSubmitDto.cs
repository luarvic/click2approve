namespace api.Models.DTOs;

// Represents a DTO required to submit an approval request.
public class ApprovalRequestSubmitDto
{
    public required long[] UserFileIds { get; set; }
    public required string[] Emails { get; set; }
    public required DateTime ApproveBy { get; set; }
    public string? Comment { get; set; }
}
