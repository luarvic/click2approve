using api.Extensions;
using api.Models;
using api.Models.DTOs;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

/// <summary>
/// API endpoints that manage approval requests.
/// </summary>
/// <param name="logger">A logger service.</param>
/// <param name="approvalRequestService">A service that manages approval requests.</param>
/// <param name="userManager">A service that manages users.</param>
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
    /// Submits the approval request.
    /// </summary>
    /// <param name="payload">A payload that contains the approval request properties.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <response code="200">If send succeeds.</response>
    /// <response code="401">If authorization fails.</response>
    /// <response code="500">If send fails.</response>
    [HttpPost]
    public async Task<IActionResult> SubmitAsync([FromBody] ApprovalRequestDto payload, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
            await _approvalRequestService.SubmitAsync(user, payload, cancellationToken);
            return Ok();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to submit approval requests.");
            return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        }
    }

    /// <summary>
    /// Lists the inbox approval requests.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>A list of the approval requests.</returns>
    /// <response code="200">If list succeeds.</response>
    /// <response code="401">If authorization fails.</response>
    /// <response code="500">If list fails.</response>
    [HttpGet("list")]
    public async Task<ActionResult<List<UserFile>>> ListAsync(CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
        // try
        // {
        //     var user = await _userManager.GetUserByPrincipalAsync(User, cancellationToken);
        //     var userFiles = await _userFileService.ListAsync(user, cancellationToken);
        //     return Ok(userFiles);
        // }
        // catch (Exception e)
        // {
        //     _logger.LogError(e, "Unable to list files.");
        //     return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
        // }
    }
}
