using api.Extentions;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

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

    [HttpGet()]
    public async Task<ActionResult<List<UserFile>>> GetUserFilesAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipal(User, cancellationToken);
        var userFiles = await _fileService.GetUserFiles(user, cancellationToken);
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
}
