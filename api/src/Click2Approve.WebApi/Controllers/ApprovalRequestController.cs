using Click2Approve.WebApi.Extensions;
using Click2Approve.Domain.Models;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Application.Services.ApprovalRequests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that manage approval requests.
/// </summary>
/// <param name="logger">The logger service.</param>
/// <param name="approvalRequestService">The service that manages approval requests and derived tasks.</param>
/// <param name="userManager">The service that manages users.</param>
[Tags("Click2Approve.WebApi.ApprovalRequest")]
[ApiController]
[Route("api/tenants/{tenantId:long}/requests")]
[Authorize]
public class ApprovalRequestController(
    ILogger<ApprovalRequestController> logger,
    IApprovalRequestService approvalRequestService,
    UserManager<AppUser> userManager) : ControllerBase
{
    private readonly ILogger<ApprovalRequestController> _logger = logger;
    private readonly IApprovalRequestService _approvalRequestService = approvalRequestService;
    private readonly UserManager<AppUser> _userManager = userManager;

    /// <summary>
    /// Submits an approval request.
    /// </summary>
    /// <param name="payload">The payload that contains the approval request properties.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    [HttpPost()]
    public async Task<IActionResult> SubmitAsync([FromBody] ApprovalRequestSubmitDto payload, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(await _approvalRequestService.SubmitApprovalRequestAsync(user, payload, cancellationToken));
    }

    /// <summary>
    /// Cancels an approval request.
    /// </summary>
    [HttpPost("{id:long}/cancel")]
    public async Task<IActionResult> CancelAsync(long id, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        await _approvalRequestService.CancelApprovalRequestAsync(user, id, cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Lists approval request summaries for the outbox.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of approval request summaries.</returns>
    [HttpGet]
    public async Task<ActionResult<List<ApprovalRequestListItemDto>>> ListAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        var approvalRequests = await _approvalRequestService.ListApprovalRequestsAsync(user, cancellationToken);
        return Ok(approvalRequests);
    }

    /// <summary>
    /// Gets an approval request with all data required by its editor.
    /// </summary>
    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApprovalRequestDto>> GetAsync(long id, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        return Ok(await _approvalRequestService.GetApprovalRequestAsync(user, id, cancellationToken));
    }
}
