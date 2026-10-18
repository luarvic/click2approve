namespace Click2Approve.WebApi.Models.Responses;

/// <summary>
/// Represents configuration returned by the API for application clients.
/// </summary>
public class ApplicationConfigurationResponse
{
    /// <summary>Configured avatar image size in pixels.</summary>
    public int AvatarImageSize { get; set; }
    /// <summary>Current product edition.</summary>
    public required string Edition { get; set; }
    /// <summary>Configured organization logo image size in pixels.</summary>
    public int LogoImageSize { get; set; }
    /// <summary>Legal notices required at signup, or null when not required by this host.</summary>
    public RegistrationLegalResponse? RegistrationLegal { get; set; }
    /// <summary>Whether users must confirm their email address.</summary>
    public bool RequiresConfirmedEmail { get; set; }
    /// <summary>Features available in the current product edition.</summary>
    public required ProductCapabilitiesResponse Capabilities { get; set; }
}
