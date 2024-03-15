namespace api.Models.DTOs;

// Represents a DTO required to submit an approval request.
public class ApprovalRequestSubmitDto
{
    public required List<long> UserFileIds { get; set; }
    public required List<string> Emails { get; set; }
    public DateTime? ApproveBy { get; set; }
    public string? Comment { get; set; }
}
