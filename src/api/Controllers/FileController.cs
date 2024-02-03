using api.Extensions;
using api.Models;
using api.Models.DTOs;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

// Implements API endpoints for managing user files (uploading, getting, deleting, etc.).
[ApiController]
[Route("file")]
[Authorize]
public class FileController(ILogger<FileController> logger, IFileService fileService, UserManager<AppUser> userManager) : ControllerBase
{
    private readonly ILogger<FileController> _logger = logger;
    private readonly IFileService _fileService = fileService;
    private readonly UserManager<AppUser> _userManager = userManager;

    [HttpPost]
    public async Task<ActionResult<List<UserFile>>> PostAsync([FromForm] IFormFileCollection files, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var userFiles = await _fileService.UploadFilesAsync(user, files, cancellationToken);
            return Ok(userFiles);
        }
        catch (Exception e)
        {
            const string message = "Unable to upload file(s).";
            _logger.LogError(e, message);
            return StatusCode(StatusCodes.Status500InternalServerError, message);
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<UserFile>>> GetUserFilesAsync(CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var userFiles = await _fileService.GetUserFilesAsync(user, cancellationToken);
            return Ok(userFiles);
        }
        catch (Exception e)
        {
            const string message = "Unable to get file(s).";
            _logger.LogError(e, message);
            return StatusCode(StatusCodes.Status500InternalServerError, message);
        }
    }

    [HttpGet("/download")]
    public async Task<IActionResult> GetFileAsync(string id, bool preview, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var (filename, bytes) = await _fileService.GetFileAsync(user, id, preview, cancellationToken);
            return new FileContentResult(bytes, MimeTypes.GetMimeType(filename))
            {
                FileDownloadName = filename
            };
        }
        catch (Exception e)
        {
            const string message = "Unable to get file(s).";
            _logger.LogError(e, message);
            return StatusCode(StatusCodes.Status500InternalServerError, message);
        }
    }

    [HttpGet("/downloadBase64")]
    public async Task<ActionResult<string>> GetFileBase64Async(string id, bool preview, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var (filename, bytes) = await _fileService.GetFileAsync(user, id, preview, cancellationToken);
            return $"data:{MimeTypes.GetMimeType(filename)};base64,{Convert.ToBase64String(bytes)}";
        }
        catch (Exception e)
        {
            const string message = "Unable to download file(s).";
            _logger.LogError(e, message);
            return StatusCode(StatusCodes.Status500InternalServerError, message);
        }
    }

    [HttpPost("/downloadArchiveBase64")]
    public async Task<ActionResult<string>> GetArchiveBase64Async([FromBody] string[] ids, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var (filename, bytes) = await _fileService.GetArchiveAsync(user, ids, cancellationToken);
            return $"data:{MimeTypes.GetMimeType(filename)};base64,{Convert.ToBase64String(bytes)}";
        }
        catch (Exception e)
        {
            const string message = "Unable to download file(s).";
            _logger.LogError(e, message);
            return StatusCode(StatusCodes.Status500InternalServerError, message);
        }
    }

    [HttpPost("/share")]
    public async Task<ActionResult<string>> ShareAsync([FromBody] FilesToShare filesToShare, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var sharedId = await _fileService.ShareUserFilesAsync(user, filesToShare.Ids, filesToShare.AvailableUntil, cancellationToken);
            return sharedId;
        }
        catch (Exception e)
        {
            const string message = "Unable to share file(s).";
            _logger.LogError(e, message);
            return StatusCode(StatusCodes.Status500InternalServerError, message);
        }
    }

    [HttpGet("/testShared")]
    [AllowAnonymous]
    public async Task<IActionResult> TestSharedArchiveAsync(string key, CancellationToken cancellationToken)
    {
        try
        {
            return await _fileService.TestSharedArchiveAsync(key, cancellationToken) ? Ok() : NotFound();
        }
        catch (Exception e)
        {
            const string message = "Unable to test shared file(s).";
            _logger.LogError(e, message);
            return StatusCode(StatusCodes.Status500InternalServerError, message);
        }
    }

    [HttpGet("/downloadShared")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSharedArchiveAsync(string key, CancellationToken cancellationToken)
    {
        try
        {
            var (filename, bytes) = await _fileService.GetSharedArchiveAsync(key, cancellationToken);
            return new FileContentResult(bytes, MimeTypes.GetMimeType(filename));
        }
        catch (Exception e)
        {
            const string message = "Unable to download shared file(s).";
            _logger.LogError(e, message);
            return StatusCode(StatusCodes.Status500InternalServerError, message);
        }
    }
}
