namespace Click2Approve.WebApi.Models.Responses;

/// <summary>Optional installation-specific legal destinations.</summary>
public class SiteLinksResponse
{
    /// <summary>URL of the installation's terms, or null when not configured.</summary>
    public string? TermsUrl { get; set; }
    /// <summary>URL of the installation's privacy notice, or null when not configured.</summary>
    public string? PrivacyUrl { get; set; }
}
