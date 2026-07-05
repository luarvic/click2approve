namespace Click2Approve.WebApi.Models.DTOs;

public class ProductInfoDto
{
    public required string Edition { get; set; }
    public required ProductCapabilitiesDto Capabilities { get; set; }
}
