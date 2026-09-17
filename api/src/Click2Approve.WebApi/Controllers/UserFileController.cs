using Asp.Versioning;
using Click2Approve.Application.Abstractions.Services.UserFiles;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Mappers.UserFiles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that manage user files.
/// </summary>
/// <param name="userFileService">The service that manages user files.</param>
/// <param name="userManager">The service that manages users.</param>
[Tags("Click2Approve.WebApi.UserFile")]
[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/tenants/{tenantGlobalId:guid}/files")]
[Authorize]
public class UserFileController(
    IUserFileService userFileService,
    UserManager<AppUser> userManager) : ControllerBase
{
    private readonly IUserFileService _userFileService = userFileService;
    private readonly UserManager<AppUser> _userManager = userManager;

    /// <summary>
    /// Uploads the files.
    /// </summary>
    /// <param name="files">The files to upload.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of uploaded files.</returns>
    [HttpPost("upload")]
    public async Task<ActionResult<List<UserFileResponse>>> UploadAsync(IFormFileCollection files, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        var userFiles = await _userFileService.UploadAsync(user, await files.ToUploadedFilesAsync(cancellationToken), cancellationToken);
        return Ok(UserFileResponseMapper.Map(userFiles));
    }

    /// <summary>
    /// Deletes a file.
    /// </summary>
    /// <param name="globalId">The global ID of the file to delete.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    [HttpDelete("{globalId:guid}")]
    public async Task<IActionResult> DeleteAsync(Guid globalId, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        await _userFileService.DeleteAsync(user, globalId, cancellationToken);
        return Ok();
    }
}
