namespace api.Models.DTOs;

// Represents an approval request DTO.
public class ApprovalRequestDto
{
    public required string[] Ids { get; set; }
    public required string[] Emails { get; set; }
    public required DateTime ApproveBy { get; set; }
    public string? Comment { get; set; }
}
