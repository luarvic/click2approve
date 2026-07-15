using Click2Approve.Application.Models.DTOs;
using Click2Approve.Application.Services.UserProfiles;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that manage user profile settings.
/// </summary>
[Tags("Click2Approve.WebApi.UserProfile")]
[ApiController]
[Route("api/userProfile")]
public class UserProfileController(IUserProfileService userProfileService, UserManager<AppUser> userManager) : ControllerBase
{
    private readonly IUserProfileService _userProfileService = userProfileService;
    private readonly UserManager<AppUser> _userManager = userManager;

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> GetAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(await _userProfileService.GetAsync(user, cancellationToken));
    }

    [HttpPut]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> UpdateAsync([FromBody] UserProfileUpdateDto payload, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(await _userProfileService.UpdateAsync(user, payload, cancellationToken));
    }

    [HttpPost("avatar")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> UploadAvatarAsync([FromForm] IFormFile avatar, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(await _userProfileService.UploadAvatarAsync(user, avatar, cancellationToken));
    }

    [HttpGet("{userId}/avatar")]
    [AllowAnonymous]
    public async Task<IActionResult> DownloadAvatarAsync(string userId, CancellationToken cancellationToken)
    {
        var (filename, bytes) = await _userProfileService.DownloadAvatarAsync(userId, cancellationToken);
        return new FileContentResult(bytes, MimeTypes.GetMimeType(filename));
    }

    [HttpDelete("avatar")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> DeleteAvatarAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(await _userProfileService.DeleteAvatarAsync(user, cancellationToken));
    }
}
