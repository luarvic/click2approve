using api.Extentions;
using api.Models;
using api.Models.DTOs;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

// A controller that implements API endpoints for managing user files (uploading, getting, deleting, etc.).
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
        var user = await _userManager.GetUserByPrincipal(User, cancellationToken);
        var userFiles = await _fileService.UploadFilesAsync(user, files, cancellationToken);
        return Ok(userFiles);
    }

    [HttpGet]
    public async Task<ActionResult<List<UserFile>>> GetUserFilesAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipal(User, cancellationToken);
        var userFiles = await _fileService.GetUserFilesAsync(user, cancellationToken);
        return Ok(userFiles);
    }

    [HttpGet("/download")]
    public async Task<FileContentResult> GetFileAsync(string id, bool preview, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipal(User, cancellationToken);
        var (filename, bytes) = await _fileService.GetFileAsync(user, id, preview, cancellationToken);
        return new FileContentResult(bytes, MimeTypes.GetMimeType(filename))
        {
            FileDownloadName = filename
        };
    }

    [HttpGet("/downloadBase64")]
    public async Task<string> GetFileBase64Async(string id, bool preview, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipal(User, cancellationToken);
        var (filename, bytes) = await _fileService.GetFileAsync(user, id, preview, cancellationToken);
        return $"data:{MimeTypes.GetMimeType(filename)};base64,{Convert.ToBase64String(bytes)}";
    }

    [HttpPost("/downloadArchiveBase64")]
    public async Task<string> GetArchiveBase64Async([FromBody] string[] ids, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipal(User, cancellationToken);
        var (filename, bytes) = await _fileService.GetArchiveAsync(user, ids, cancellationToken);
        return $"data:{MimeTypes.GetMimeType(filename)};base64,{Convert.ToBase64String(bytes)}";
    }

    [HttpPost("/share")]
    public async Task<string> ShareAsync([FromBody] FilesToShare filesToShare, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipal(User, cancellationToken);
        var sharedId = await _fileService.ShareUserFilesAsync(user, filesToShare.Ids, filesToShare.AvailableUntil, cancellationToken);
        return sharedId;
    }

    [HttpGet("/testShared")]
    [AllowAnonymous]
    public async Task<ActionResult> TestSharedArchiveAsync(string key, CancellationToken cancellationToken)
    {
        return await _fileService.TestSharedArchiveAsync(key, cancellationToken) ? Ok() : NotFound();
    }

    [HttpGet("/downloadShared")]
    [AllowAnonymous]
    public async Task<FileContentResult> GetSharedArchiveAsync(string key, CancellationToken cancellationToken)
    {
        var (filename, bytes) = await _fileService.GetSharedArchiveAsync(key, cancellationToken);
        return new FileContentResult(bytes, MimeTypes.GetMimeType(filename));
    }
}
