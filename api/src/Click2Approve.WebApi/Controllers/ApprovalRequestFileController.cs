using Asp.Versioning;
using Click2Approve.Application.Abstractions.Services.UserFiles;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that manage files attached to approval requests.
/// </summary>
/// <param name="userFileService">The service that manages user files.</param>
/// <param name="userManager">The service that manages users.</param>
[Tags("Click2Approve.WebApi.ApprovalRequestFile")]
[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/tenants/{tenantGlobalId:guid}/requests/{approvalRequestGlobalId:guid}/files")]
[Authorize]
public class ApprovalRequestFileController(IUserFileService userFileService, UserManager<AppUser> userManager) : ControllerBase
{
    private readonly IUserFileService _userFileService = userFileService;
    private readonly UserManager<AppUser> _userManager = userManager;

    /// <summary>
    /// Downloads a base64 representation of a file attached to an approval request.
    /// </summary>
    [HttpGet("{globalId:guid}/downloadBase64")]
    public async Task<ActionResult<string>> DownloadBase64Async(Guid globalId, Guid approvalRequestGlobalId, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        var (filename, bytes) = await _userFileService.DownloadApprovalRequestFileAsync(user, globalId, approvalRequestGlobalId, cancellationToken);
        return $"data:{MimeTypes.GetMimeType(filename)};base64,{Convert.ToBase64String(bytes)}";
    }
}
