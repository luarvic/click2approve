using Asp.Versioning;
using Click2Approve.Application.Services.Tenants;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that expose the authenticated user's personal tenant scope.
/// </summary>
[Tags("Click2Approve.WebApi.CurrentTenant")]
[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/tenants")]
[Authorize]
public class CurrentTenantController(ITenantService tenantService, UserManager<AppUser> userManager) : ControllerBase
{
    private readonly ITenantService _tenantService = tenantService;
    private readonly UserManager<AppUser> _userManager = userManager;

    /// <summary>
    /// Gets the personal tenant that is always available to the authenticated user.
    /// </summary>
    [HttpGet("current")]
    public async Task<ActionResult<CurrentTenantDto>> GetCurrentAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        var tenant = await _tenantService.GetRequiredDefaultAsync(user, cancellationToken);
        return Ok(new CurrentTenantDto { Id = tenant.Id });
    }
}
