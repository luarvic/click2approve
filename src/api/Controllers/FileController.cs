using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

// A controller that implements API endpoints for managing user files (uploading, getting, deleting, etc.).
[ApiController]
[Route("[controller]")]
public class FileController(ILogger<FileController> logger, IFileService fileService) : ControllerBase
{
    private readonly ILogger<FileController> _logger = logger;
    private readonly IFileService _fileService = fileService;

    [HttpPost]
    public async Task<IActionResult> PostAsync(IFormFileCollection files, CancellationToken cancellationToken)
    {
        await _fileService.UploadFilesAsync(files, cancellationToken);
        return Ok();
    }

    [HttpGet()]
    public async Task<FileContentResult> GetFileAsync(string id, bool preview, CancellationToken cancellationToken)
    {
        var (Filename, Bytes) = await _fileService.GetFileAsync(id, preview, cancellationToken);
        return new FileContentResult(Bytes, MimeTypes.GetMimeType(Filename))
        {
            FileDownloadName = Filename
        };
    }
}
