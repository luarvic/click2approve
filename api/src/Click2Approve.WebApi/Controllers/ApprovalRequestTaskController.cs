using Click2Approve.WebApi.Extensions;
using Click2Approve.Domain.Models;
using Click2Approve.Application.Models.DTOs;
using Click2Approve.Application.Services.ApprovalRequests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that manage approval request tasks.
/// </summary>
/// <param name="logger">The logger service.</param>
/// <param name="approvalRequestService">The service that manages approval requests and derived tasks.</param>
/// <param name="userManager">The service that manages users.</param>
[Tags("Click2Approve.WebApi.ApprovalRequestTask")]
[ApiController]
[Route("api/task")]
[Authorize]
public class ApprovalRequestTaskController(
    ILogger<ApprovalRequestTaskController> logger,
    IApprovalRequestService approvalRequestService,
    UserManager<AppUser> userManager) : ControllerBase
{
    private readonly ILogger<ApprovalRequestTaskController> _logger = logger;
    private readonly IApprovalRequestService _approvalRequestService = approvalRequestService;
    private readonly UserManager<AppUser> _userManager = userManager;

    /// <summary>
    /// Complete an approval request task.
    /// </summary>
    /// <param name="payload">The payload that contains the approval request task properties.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    [HttpPost("complete")]
    public async Task<IActionResult> CompleteAsync([FromBody] ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        await _approvalRequestService.CompleteTaskAsync(user, payload, cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Lists incoming approval request tasks.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of approval request tasks.</returns>
    [HttpGet("list")]
    public async Task<ActionResult<List<ApprovalRequestTask>>> ListAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        var tasks = await _approvalRequestService.ListTasksAsync(user, cancellationToken);
        return Ok(tasks);
    }

    /// <summary>
    /// Gets number of uncompleted approval request tasks.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The number of the approval requests.</returns>
    [HttpGet("countUncompleted")]
    public async Task<ActionResult<long>> CountUncompletedAsync(CancellationToken cancellationToken)
    {
        var user = await _userManager.GetAppUserAsync(User);
        var count = await _approvalRequestService.CountUncompletedTasksAsync(user, cancellationToken);
        return Ok(count);
    }
}
