namespace click2approve.WebAPI.Models.DTOs;

/// <summary>
/// Represents a data transfer object required to submit an approval request.
/// </summary>
public class ApprovalRequestSubmitDto
{
    public required List<long> UserFileIds { get; set; }
    public required List<string> Emails { get; set; }
    public DateTime? ApproveBy { get; set; }
    public string? Comment { get; set; }
}
