namespace Click2Approve.WebApi.Models.DTOs;

/// <summary>
/// Represents product metadata returned by the API.
/// </summary>
public class ProductInfoDto
{
    public required string Edition { get; set; }
    public bool RequiresConfirmedEmail { get; set; }
    public required ProductCapabilitiesDto Capabilities { get; set; }
}
