namespace Click2Approve.WebApi.Models.Auxiliary;

/// <summary>
/// Represents an email message.
/// </summary>
public class EmailMessage
{
    public required string ToAddress { get; set; }
    public required string Subject { get; set; }
    public string? Body { get; set; }
    public string? AttachmentPath { get; set; }
}
