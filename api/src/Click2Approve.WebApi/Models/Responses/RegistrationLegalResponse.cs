namespace Click2Approve.WebApi.Models.Responses;

/// <summary>Identifies legal notices that must be acknowledged at registration.</summary>
public sealed class RegistrationLegalResponse
{
    /// <summary>Version of the privacy notice presented at signup.</summary>
    public required string PrivacyVersion { get; set; }
    /// <summary>Public URL of the privacy notice.</summary>
    public required string PrivacyUrl { get; set; }
    /// <summary>Version of the terms presented at signup.</summary>
    public required string TermsVersion { get; set; }
    /// <summary>Public URL of the terms.</summary>
    public required string TermsUrl { get; set; }
}
