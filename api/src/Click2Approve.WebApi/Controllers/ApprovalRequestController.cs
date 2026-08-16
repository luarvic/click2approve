using Asp.Versioning;
using Click2Approve.Application.Abstractions.Services.ApprovalRequests;
using Click2Approve.Application.Abstractions.Services.UserFiles;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Mappers.ApprovalRequests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that manage approval requests.
/// </summary>
/// <param name="logger">The logger service.</param>
/// <param name="approvalRequestService">The service that manages approval requests.</param>
/// <param name="userFileService">The service that reads approval-request attachments.</param>
/// <param name="userManager">The service that manages users.</param>
[Tags("Click2Approve.WebApi.ApprovalRequest")]
[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/tenants/{tenantGlobalId:guid}/requests")]
[Authorize]
public class ApprovalRequestController(
    ILogger<ApprovalRequestController> logger,
    IApprovalRequestService approvalRequestService,
    IUserFileService userFileService,
    UserManager<AppUser> userManager) : ControllerBase
{
    private readonly ILogger<ApprovalRequestController> _logger = logger;
    private readonly IApprovalRequestService _approvalRequestService = approvalRequestService;
    private readonly IUserFileService _userFileService = userFileService;
    private readonly UserManager<AppUser> _userManager = userManager;

    /// <summary>
    /// Submits an approval request.
    /// </summary>
    /// <param name="payload">The payload that contains the approval request properties.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    [HttpPost()]
    public async Task<IActionResult> SubmitAsync([FromBody] SubmitApprovalRequestRequest payload, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(await _approvalRequestService.SubmitAsync(user, ApprovalRequestCommandMapper.Map(payload), cancellationToken));
    }

    /// <summary>
    /// Cancels an approval request.
    /// </summary>
    [HttpPost("{globalId:guid}/cancel")]
    public async Task<IActionResult> CancelAsync(Guid globalId, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        await _approvalRequestService.CancelAsync(user, globalId, cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Lists approval request summaries for the outbox.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of approval request summaries.</returns>
    [HttpGet]
    public async Task<ActionResult<List<ApprovalRequestListItemResponse>>> ListAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        var approvalRequests = await _approvalRequestService.ListAsync(user, cancellationToken);
        return Ok(ApprovalRequestResponseMapper.Map(approvalRequests));
    }

    /// <summary>
    /// Gets an approval request with all data required by its editor.
    /// </summary>
    [HttpGet("{globalId:guid}")]
    public async Task<ActionResult<ApprovalRequestDetailsResponse>> GetAsync(Guid globalId, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(ApprovalRequestResponseMapper.Map(await _approvalRequestService.GetAsync(user, globalId, cancellationToken)));
    }

    /// <summary>
    /// Downloads a base64 representation of an attachment belonging to an approval request.
    /// </summary>
    [HttpGet("{approvalRequestGlobalId:guid}/attachments/{globalId:guid}/downloadBase64")]
    public async Task<ActionResult<string>> DownloadAttachmentBase64Async(
        Guid approvalRequestGlobalId,
        Guid globalId,
        CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        var (filename, bytes) = await _userFileService.DownloadApprovalRequestAttachmentAsync(
            user,
            globalId,
            approvalRequestGlobalId,
            cancellationToken);
        return $"data:{MimeTypes.GetMimeType(filename)};base64,{Convert.ToBase64String(bytes)}";
    }
}
