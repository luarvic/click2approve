namespace api.Models;

// Represents a sent user's file.
public class UserFileForApproval
{
    public long Id { get; set; }
    public required UserFile UserFile { get; set; }
    public required string Approver { get; set; }
    public required DateTime ApproveBy { get; set; }
    public required string? Comment { get; set; }
    public required DateTime SendDate { get; set; }
}
