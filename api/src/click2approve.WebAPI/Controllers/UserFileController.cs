using click2approve.WebAPI.Extensions;
using click2approve.WebAPI.Models;
using click2approve.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace click2approve.WebAPI.Controllers;

/// <summary>
/// API endpoints that manage user files.
/// </summary>
/// <param name="logger">A logger service.</param>
/// <param name="userFileService">A service that manages user files.</param>
/// <param name="userManager">A service that manages users.</param>
[Tags("click2approve.WebAPI.UserFile")]
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
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>A list of uploaded files.</returns>
    /// <response code="200">If request succeeded.</response>
    /// <response code="401">If authorization failed.</response>
    /// <response code="500">If request failed.</response>
    [HttpPost("upload")]
    public async Task<ActionResult<List<UserFile>>> UploadAsync([FromForm] IFormFileCollection files, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var userFiles = await _userFileService.UploadAsync(user, files, cancellationToken);
            return Ok(userFiles);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to upload files.");
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }

    /// <summary>
    /// Lists the files.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>A list of the user files.</returns>
    /// <response code="200">If request succeeded.</response>
    /// <response code="401">If authorization failed.</response>
    /// <response code="500">If request failed.</response>
    [HttpGet("list")]
    public async Task<ActionResult<List<UserFile>>> ListAsync(CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var userFiles = await _userFileService.ListAsync(user, cancellationToken);
            return Ok(userFiles);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to list files.");
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }

    /// <summary>
    /// Downloads the file.
    /// </summary>
    /// <param name="id">An ID of the file to download.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The FileContentResult object.</returns>
    /// <response code="200">If request succeeded.</response>
    /// <response code="401">If authorization failed.</response>
    /// <response code="500">If request failed.</response>
    [HttpGet("download")]
    public async Task<IActionResult> DownloadAsync(long id, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var (filename, bytes) = await _userFileService.DownloadAsync(user, id, cancellationToken);
            return new FileContentResult(bytes, MimeTypes.GetMimeType(filename))
            {
                FileDownloadName = filename
            };
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to download a file with id {id}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }

    /// <summary>
    /// Downloads a base64 representation of the file.
    /// </summary>
    /// <param name="id">An ID of the file to download.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The base64 string.</returns>
    /// <response code="200">If request succeeded.</response>
    /// <response code="401">If authorization failed.</response>
    /// <response code="500">If request failed.</response>
    [HttpGet("downloadBase64")]
    public async Task<ActionResult<string>> DownloadBase64Async(long id, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var (filename, bytes) = await _userFileService.DownloadAsync(user, id, cancellationToken);
            return $"data:{MimeTypes.GetMimeType(filename)};base64,{Convert.ToBase64String(bytes)}";
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to download a file with id {id}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }

    /// <summary>
    /// Deletes a file.
    /// </summary>
    /// <param name="id">An ID of the file to delete.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <response code="200">If request succeeded.</response>
    /// <response code="401">If authorization failed.</response>
    /// <response code="500">If request failed.</response>
    [HttpDelete()]
    public async Task<IActionResult> DeleteAsync(long id, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            await _userFileService.DeleteAsync(user, id, cancellationToken);
            return Ok();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to delete a file with id {id}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }
}
