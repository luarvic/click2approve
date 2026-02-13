using Click2Approve.WebAPI.Extensions;
using Click2Approve.WebAPI.Models;
using Click2Approve.WebAPI.Models.DTOs;
using Click2Approve.WebAPI.Services.ApprovalRequestService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebAPI.Controllers;

/// <summary>
/// API endpoints that manage approval request tasks.
/// </summary>
/// <param name="logger">A logger service.</param>
/// <param name="approvalRequestService">A service that manages approval requests and derived tasks.</param>
/// <param name="userManager">A service that manages users.</param>
[Tags("Click2Approve.WebAPI.ApprovalRequestTask")]
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
    /// <param name="payload">A payload that contains the approval request task properties.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <response code="200">If request succeeded.</response>
    /// <response code="401">If authorization failed.</response>
    /// <response code="500">If request failed.</response>
    [HttpPost("complete")]
    public async Task<IActionResult> CompleteAsync([FromBody] ApprovalRequestTaskCompleteDto payload, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            await _approvalRequestService.CompleteTaskAsync(user, payload, cancellationToken);
            return Ok();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to complete an approval request task.");
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }

    /// <summary>
    /// Lists uncompleted approval request tasks.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>A list of the approval request tasks.</returns>
    /// <response code="200">If request succeeded.</response>
    /// <response code="401">If authorization failed.</response>
    /// <response code="500">If request failed.</response>
    [HttpGet("listUncompleted")]
    public async Task<ActionResult<List<UserFile>>> ListUncompletedAsync(CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var approvalRequests = await _approvalRequestService.ListTasksAsync(user, [ApprovalStatus.Submitted], cancellationToken);
            return Ok(approvalRequests);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to list uncompleted approval request tasks.");
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }

    /// <summary>
    /// Lists completed approval request tasks.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>A list of the approval request tasks.</returns>
    /// <response code="200">If request succeeded.</response>
    /// <response code="401">If authorization failed.</response>
    /// <response code="500">If request failed.</response>
    [HttpGet("listCompleted")]
    public async Task<ActionResult<List<UserFile>>> ListCompletedAsync(CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var approvalRequests = await _approvalRequestService.ListTasksAsync(user, [ApprovalStatus.Approved, ApprovalStatus.Rejected], cancellationToken);
            return Ok(approvalRequests);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to list completed approval request tasks.");
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }

    /// <summary>
    /// Gets number of uncompleted approval request tasks.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The number of the approval requests.</returns>
    /// <response code="200">If request succeeded.</response>
    /// <response code="401">If authorization failed.</response>
    /// <response code="500">If request failed.</response>
    [HttpGet("countUncompleted")]
    public async Task<ActionResult<long>> CountUncompletedAsync(CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var count = await _approvalRequestService.CountUncompletedTasksAsync(user, cancellationToken);
            return Ok(count);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to count uncompleted approval request tasks.");
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }
}
