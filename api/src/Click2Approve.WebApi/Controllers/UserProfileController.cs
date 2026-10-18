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

    /// <summary>
    /// Gets the current user profile.
    /// </summary>
    /// <param name="cancellationToken">Cancels the operation.</param>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<UserProfileResponse>> GetAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(UserProfileContractMapper.Map(await _userProfileService.GetAsync(user, cancellationToken)));
    }

    /// <summary>
    /// Updates the current user profile.
    /// </summary>
    /// <param name="payload">The user profile details.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    [HttpPut]
    [Authorize]
    public async Task<ActionResult<UserProfileResponse>> UpdateAsync([FromBody] UpdateUserProfileRequest payload, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(UserProfileContractMapper.Map(await _userProfileService.UpdateAsync(user, UserProfileContractMapper.Map(payload), cancellationToken)));
    }

    /// <summary>
    /// Sets the current user avatar.
    /// </summary>
    /// <param name="avatar">The avatar image file.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    [HttpPost("avatar")]
    [Authorize]
    public async Task<ActionResult<UserProfileResponse>> SetAvatarAsync(
        IFormFile avatar,
        CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(UserProfileContractMapper.Map(
            await _userProfileService.SetAvatarAsync(user, await avatar.ToUploadedFileAsync(cancellationToken), cancellationToken)));
    }

    /// <summary>
    /// Redirects to a user avatar.
    /// </summary>
    /// <param name="userGlobalId">The user ID.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    [HttpGet("{userGlobalId:guid}/avatar")]
    [AllowAnonymous]
    public async Task<IActionResult> DownloadAvatarAsync(Guid userGlobalId, CancellationToken cancellationToken)
    {
        return Redirect(await _userProfileService.GetAvatarUrlAsync(userGlobalId, cancellationToken));
    }

    /// <summary>
    /// Deletes the current user avatar.
    /// </summary>
    /// <param name="cancellationToken">Cancels the operation.</param>
    [HttpDelete("avatar")]
    [Authorize]
    public async Task<ActionResult<UserProfileResponse>> DeleteAvatarAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(UserProfileContractMapper.Map(await _userProfileService.DeleteAvatarAsync(user, cancellationToken)));
    }
}
