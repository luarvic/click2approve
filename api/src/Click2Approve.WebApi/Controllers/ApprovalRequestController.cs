using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Models;
using Click2Approve.WebApi.Models.DTOs;
using Click2Approve.WebApi.Services.ApprovalRequestService;
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
[Route("api/request")]
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
        var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
        await _approvalRequestService.SubmitApprovalRequestAsync(user, payload, cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Deletes an approval request.
    /// </summary>
    /// <param name="id">The ID of the approval request to delete.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    [HttpDelete()]
    public async Task<IActionResult> DeleteAsync(long id, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
        await _approvalRequestService.DeleteApprovalRequestAsync(user, id, cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Lists approval requests.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of approval requests.</returns>
    [HttpGet("list")]
    public async Task<ActionResult<List<ApprovalRequest>>> ListAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
        var approvalRequests = await _approvalRequestService.ListApprovalRequestsAsync(user, cancellationToken);
        return Ok(approvalRequests);
    }
}
