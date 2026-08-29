namespace Click2Approve.Application.Models.Emails;

/// <summary>
/// Represents an email message.
/// </summary>
public class EmailMessage
{
    public required string ToAddress { get; set; }
    public required string Subject { get; set; }
    public string? Body { get; set; }
}
