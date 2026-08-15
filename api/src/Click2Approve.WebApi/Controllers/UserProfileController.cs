using Asp.Versioning;
using Click2Approve.Application.Abstractions.Services.UserProfiles;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Mappers.UserProfiles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that manage user profile settings.
/// </summary>
[Tags("Click2Approve.WebApi.UserProfile")]
[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/userProfiles")]
public class UserProfileController(IUserProfileService userProfileService, UserManager<AppUser> userManager) : ControllerBase
{
    private readonly IUserProfileService _userProfileService = userProfileService;
    private readonly UserManager<AppUser> _userManager = userManager;

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<UserProfileResponse>> GetAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(UserProfileContractMapper.Map(await _userProfileService.GetAsync(user, cancellationToken)));
    }

    [HttpPut]
    [Authorize]
    public async Task<ActionResult<UserProfileResponse>> UpdateAsync([FromBody] UpdateUserProfileRequest payload, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(UserProfileContractMapper.Map(await _userProfileService.UpdateAsync(user, UserProfileContractMapper.Map(payload), cancellationToken)));
    }

    [HttpPost("avatar")]
    [Authorize]
    public async Task<ActionResult<UserProfileResponse>> UploadAvatarAsync(IFormFile avatar, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(UserProfileContractMapper.Map(await _userProfileService.UploadAvatarAsync(user, await avatar.ToUploadedFileAsync(cancellationToken), cancellationToken)));
    }

    [HttpGet("{userGlobalId:guid}/avatar")]
    [AllowAnonymous]
    public async Task<IActionResult> DownloadAvatarAsync(Guid userGlobalId, CancellationToken cancellationToken)
    {
        return Redirect(await _userProfileService.GetAvatarUrlAsync(userGlobalId, cancellationToken));
    }

    [HttpDelete("avatar")]
    [Authorize]
    public async Task<ActionResult<UserProfileResponse>> DeleteAvatarAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(UserProfileContractMapper.Map(await _userProfileService.DeleteAvatarAsync(user, cancellationToken)));
    }
}
