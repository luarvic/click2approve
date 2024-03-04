namespace api.Models.DTOs;

// Represents a payload with the files to send.
public class FilesToSend
{
    public required string[] Ids { get; set; }
    public required string[] RecipientEmails { get; set; }
    public required DateTime ApproveUntilDate { get; set; }
}
