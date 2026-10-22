namespace Click2Approve.Application.Models.Emails;

/// <summary>Identifies the business actor separately from the platform sender.</summary>
public sealed record EmailActor
{
    public string? DisplayName { get; init; }
    public string? AvatarUrl { get; init; }
    public string? OrganizationDisplayName { get; init; }
    public string? OrganizationLogoUrl { get; init; }
    public bool IsSystemGenerated { get; init; }

    public string Name => IsSystemGenerated ? "Click2Approve"
        : !string.IsNullOrWhiteSpace(DisplayName) ? DisplayName
        : !string.IsNullOrWhiteSpace(OrganizationDisplayName) ? OrganizationDisplayName : "Click2Approve";
}
