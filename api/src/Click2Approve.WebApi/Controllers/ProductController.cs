using Click2Approve.WebApi.Models.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that expose product metadata.
/// </summary>
[Tags("Click2Approve.WebApi.Product")]
[ApiController]
[Route("api/product")]
public class ProductController(IConfiguration configuration) : ControllerBase
{
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Gets product edition and capabilities.
    /// </summary>
    [HttpGet("info")]
    public ActionResult<ProductInfoDto> GetInfo()
    {
        var edition = _configuration["Product:Edition"] ?? "OpenSource";
        return Ok(new ProductInfoDto
        {
            Edition = edition,
            Capabilities = new ProductCapabilitiesDto
            {
                Tenants = _configuration.GetValue<bool>("Product:Capabilities:Tenants"),
                EmployeeApprovers = _configuration.GetValue<bool>("Product:Capabilities:EmployeeApprovers"),
                TeamApprovers = _configuration.GetValue<bool>("Product:Capabilities:TeamApprovers"),
                ApprovalStepTemplates = _configuration.GetValue<bool>("Product:Capabilities:ApprovalStepTemplates")
            }
        });
    }
}
