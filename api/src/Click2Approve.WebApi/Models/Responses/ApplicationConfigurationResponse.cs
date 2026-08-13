namespace Click2Approve.WebApi.Models.Responses;

/// <summary>
/// Represents configuration returned by the API for application clients.
/// </summary>
public class ApplicationConfigurationResponse
{
    public int AvatarImageSize { get; set; }
    public required string Edition { get; set; }
    public int LogoImageSize { get; set; }
    public bool RequiresConfirmedEmail { get; set; }
    public required ProductCapabilitiesResponse Capabilities { get; set; }
}
