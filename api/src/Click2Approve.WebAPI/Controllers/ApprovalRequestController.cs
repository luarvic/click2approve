using Click2Approve.WebAPI.Extensions;
using Click2Approve.WebAPI.Models;
using Click2Approve.WebAPI.Models.DTOs;
using Click2Approve.WebAPI.Services.ApprovalRequestService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Click2Approve.WebAPI.Controllers;

/// <summary>
/// API endpoints that manage approval requests.
/// </summary>
/// <param name="logger">A logger service.</param>
/// <param name="approvalRequestService">A service that manages approval requests and derived tasks.</param>
/// <param name="userManager">A service that manages users.</param>
[Tags("Click2Approve.WebAPI.ApprovalRequest")]
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
    /// <param name="payload">A payload that contains the approval request properties.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <response code="200">If request succeeded.</response>
    /// <response code="401">If authorization failed.</response>
    /// <response code="500">If request failed.</response>
    [HttpPost()]
    public async Task<IActionResult> SubmitAsync([FromBody] ApprovalRequestSubmitDto payload, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            await _approvalRequestService.SubmitApprovalRequestAsync(user, payload, cancellationToken);
            return Ok();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to submit an approval request.");
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }

    /// <summary>
    /// Deletes an approval request.
    /// </summary>
    /// <param name="id">An ID of the approval request to delete.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <response code="200">If request succeeded.</response>
    /// <response code="401">If authorization failed.</response>
    /// <response code="500">If request failed.</response>
    [HttpDelete()]
    public async Task<IActionResult> DeleteAsync(long id, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            await _approvalRequestService.DeleteApprovalRequestAsync(user, id, cancellationToken);
            return Ok();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to delete an approval request with id {id}.", id);
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }

    /// <summary>
    /// Lists approval requests.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>A list of the approval requests.</returns>
    /// <response code="200">If request succeeded.</response>
    /// <response code="401">If authorization failed.</response>
    /// <response code="500">If request failed.</response>
    [HttpGet("list")]
    public async Task<ActionResult<List<ApprovalRequest>>> ListAsync(CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            var approvalRequests = await _approvalRequestService.ListApprovalRequestsAsync(user, cancellationToken);
            return Ok(approvalRequests);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to list approval requests.");
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }
}
