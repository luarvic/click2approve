using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that expose configuration required by the application client.
/// </summary>
[Tags("Click2Approve.WebApi.ApplicationConfiguration")]
[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/products")]
public class ApplicationConfigurationController(IConfiguration configuration) : ControllerBase
{
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Gets the edition, capabilities, and client configuration.
    /// </summary>
    [HttpGet("info")]
    public ActionResult<ApplicationConfigurationResponse> GetConfiguration()
    {
        var edition = _configuration["Product:Edition"] ?? "OpenSource";
        return Ok(new ApplicationConfigurationResponse
        {
            AvatarImageSize = _configuration.GetValue<int>("Limitations:AvatarImageSize"),
            Edition = edition,
            LogoImageSize = _configuration.GetValue<int>("Limitations:LogoImageSize"),
            RequiresConfirmedEmail = _configuration.GetValue<bool>("Identity:RequireConfirmedEmail"),
            Capabilities = new ProductCapabilitiesResponse
            {
                Tenants = _configuration.GetValue<bool>("Product:Capabilities:Tenants"),
                ApiTokens = _configuration.GetValue<bool>("Product:Capabilities:ApiTokens"),
                Discussions = _configuration.GetValue<bool>("Product:Capabilities:Discussions"),
                DiscussionAttachments = _configuration.GetValue<bool>("Product:Capabilities:DiscussionAttachments"),
                EmployeeAssignees = _configuration.GetValue<bool>("Product:Capabilities:EmployeeAssignees"),
                TeamAssignees = _configuration.GetValue<bool>("Product:Capabilities:TeamAssignees"),
                ApprovalStepTemplates = _configuration.GetValue<bool>("Product:Capabilities:ApprovalStepTemplates"),
                ApprovalRequestRevisions = _configuration.GetValue<bool>("Product:Capabilities:ApprovalRequestRevisions"),
                Receipts = _configuration.GetValue<bool>("Product:Capabilities:Receipts"),
                Subscriptions = _configuration.GetValue<bool>("Product:Capabilities:Subscriptions"),
                TaskAttachments = _configuration.GetValue<bool>("Product:Capabilities:TaskAttachments")
            }
        });
    }
}
