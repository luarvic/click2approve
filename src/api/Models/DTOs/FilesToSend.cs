namespace api.Models.DTOs;

// Represents a payload with the files to send.
public class FilesToSend
{
    public required string[] Ids { get; set; }
    public required string[] Approvers { get; set; }
    public required DateTime ApproveBy { get; set; }
    public string? Comment { get; set; }
}
