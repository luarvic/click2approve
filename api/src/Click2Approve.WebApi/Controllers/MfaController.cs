using Asp.Versioning;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Models.Responses.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// Reads MFA status without creating or exposing an authenticator secret.
/// </summary>
[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/account/mfa")]
[Authorize]
public sealed class MfaController(UserManager<AppUser> users) : ControllerBase
{
    /// <summary>
    /// Returns enrollment and deployment availability without changing the security stamp.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<MfaStatusResponse>> GetAsync()
    {
        var user = await users.GetUserAsync(User);
        return user is null ? Unauthorized() : Ok(new MfaStatusResponse(
            await users.GetTwoFactorEnabledAsync(user), IsAvailable: true));
    }
}
