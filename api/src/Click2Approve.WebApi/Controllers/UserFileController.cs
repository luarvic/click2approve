using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Models;
using Click2Approve.WebApi.Services.UserFileService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that manage user files.
/// </summary>
/// <param name="logger">The logger service.</param>
/// <param name="userFileService">The service that manages user files.</param>
/// <param name="userManager">The service that manages users.</param>
[Tags("Click2Approve.WebApi.UserFile")]
[ApiController]
[Route("api/file")]
[Authorize]
public class UserFileController(ILogger<UserFileController> logger, IUserFileService userFileService, UserManager<AppUser> userManager) : ControllerBase
{
    private readonly ILogger<UserFileController> _logger = logger;
    private readonly IUserFileService _userFileService = userFileService;
    private readonly UserManager<AppUser> _userManager = userManager;

    /// <summary>
    /// Uploads the files.
    /// </summary>
    /// <param name="files">The files to upload.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of uploaded files.</returns>
    [HttpPost("upload")]
    public async Task<ActionResult<List<UserFile>>> UploadAsync([FromForm] IFormFileCollection files, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
        var userFiles = await _userFileService.UploadAsync(user, files, cancellationToken);
        return Ok(userFiles);
    }

    /// <summary>
    /// Lists the files.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of user files.</returns>
    [HttpGet("list")]
    public async Task<ActionResult<List<UserFile>>> ListAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
        var userFiles = await _userFileService.ListAsync(user, cancellationToken);
        return Ok(userFiles);
    }

    /// <summary>
    /// Downloads the file.
    /// </summary>
    /// <param name="id">The ID of the file to download.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The FileContentResult object.</returns>
    [HttpGet("download")]
    public async Task<IActionResult> DownloadAsync(long id, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
        var (filename, bytes) = await _userFileService.DownloadAsync(user, id, cancellationToken);
        return new FileContentResult(bytes, MimeTypes.GetMimeType(filename))
        {
            FileDownloadName = filename
        };
    }

    /// <summary>
    /// Downloads a base64 representation of the file.
    /// </summary>
    /// <param name="id">The ID of the file to download.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The base64 string.</returns>
    [HttpGet("downloadBase64")]
    public async Task<ActionResult<string>> DownloadBase64Async(long id, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
        var (filename, bytes) = await _userFileService.DownloadAsync(user, id, cancellationToken);
        return $"data:{MimeTypes.GetMimeType(filename)};base64,{Convert.ToBase64String(bytes)}";
    }

    /// <summary>
    /// Deletes a file.
    /// </summary>
    /// <param name="id">The ID of the file to delete.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    [HttpDelete()]
    public async Task<IActionResult> DeleteAsync(long id, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
        await _userFileService.DeleteAsync(user, id, cancellationToken);
        return Ok();
    }
}
