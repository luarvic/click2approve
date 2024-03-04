namespace api.Models;

// Represents a sent user's file.
public class UserFileForApproval
{
    public long Id { get; set; }
    public required UserFile UserFile { get; set; }
    public required string RecipientEmail { get; set; }
    public required DateTime SendDate { get; set; }
    public required DateTime ApproveUntilDate { get; set; }
}
