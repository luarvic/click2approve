namespace api.Models;

public class EmailMessage
{
    public required string ToAddress { get; set; }
    public required string Subject { get; set; }
    public string? Body { get; set; }
    public string? AttachmentPath { get; set; }
}
