namespace Click2Approve.Application.Models.Emails;

/// <summary>Contains the profile or organization details shown with a notification.</summary>
public sealed record EmailSenderIdentity
{
    public required string Name { get; init; }
    public bool IsOrganization { get; init; }
    public string? ImageUrl { get; init; }
    public string? WebsiteUrl { get; init; }
}
