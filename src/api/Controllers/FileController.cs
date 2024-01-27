using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("[controller]")]
public class FileController : ControllerBase
{
    private readonly ILogger<FileController> _logger;
    private readonly IFileService _fileService;

    public FileController(ILogger<FileController> logger, IFileService fileService)
    {
        _logger = logger;
        _fileService = fileService;
    }

    [HttpPost]
    public async Task<IActionResult> Post(IFormFileCollection files)
    {
        var userFiles = await _fileService.UploadFilesAsync(files);
        _logger.LogInformation(string.Join(", ", userFiles.Select(f => f.Name)));
        return Ok();
    }
}
