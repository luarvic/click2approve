namespace Click2Approve.Application.Models.Emails;

/// <summary>Contains plain text and links for the shared transactional email layout.</summary>
public sealed record EmailTemplateModel
{
    public required string Subject { get; init; }
    public required string Heading { get; init; }
    public required string Body { get; init; }
    public required string PrimaryActionText { get; init; }
    public required string PrimaryActionUrl { get; init; }
    public EmailActor? Actor { get; init; }
    public string? RequestTitle { get; init; }
    public string BodyAfterTitle { get; init; } = string.Empty;
    public string? StepName { get; init; }
    public string? MessagePreview { get; init; }
    public string? Details { get; init; }
    public string Footer { get; init; } = "You're receiving this email because you're a participant in a request on Click2Approve.";
}
