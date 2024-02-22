using api.Models.DTOs;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

/// <summary>
/// API endpoints that manage user accounts (register, authenticate, etc.).
/// </summary>
/// <param name="accountService">A service that manages user accounts.</param>
/// <param name="tokenService">A service that manages authorization tokens.</param>
/// <param name="logger">A logger service.</param>
[ApiController]
[Route("api/account")]
public class AccountController(IAccountService accountService, ITokenService tokenService, ILogger<AccountController> logger) : ControllerBase
{
    private readonly IAccountService _accountService = accountService;
    private readonly ITokenService _tokenService = tokenService;
    private readonly ILogger<AccountController> _logger = logger;

    /// <summary>
    /// Registers a new user.
    /// </summary>
    /// <param name="credentials">The username and password.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The authorization token.</returns>
    /// <response code="200">If registration succeeds.</response>
    /// <response code="400">If registration fails.</response>
    [HttpPost("register")]
    public async Task<ActionResult<string>> RegisterAsync([FromBody] CredentialsDto credentials, CancellationToken cancellationToken)
    {
        try
        {
            await _accountService.RegisterUserAsync(credentials.Username, credentials.Password, cancellationToken);
            var token = _tokenService.GetTokenFromCredentials(credentials.Username, credentials.Password);
            return Ok(token);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to register user {Username}.", credentials.Username);
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Authenticates a user.
    /// </summary>
    /// <param name="credentials">The username and password.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns>The authorization token.</returns>
    /// <response code="200">If authentication succeeds.</response>
    /// <response code="401">If authentication fails.</response>
    [HttpPost("authenticate")]
    public async Task<ActionResult<string>> AuthenticateAsync([FromBody] CredentialsDto credentials, CancellationToken cancellationToken)
    {
        try
        {
            await _accountService.AuthenticateUserAsync(credentials.Username, credentials.Password, cancellationToken);
            var token = _tokenService.GetTokenFromCredentials(credentials.Username, credentials.Password);
            return Ok(token);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unable to authenticate user {Username}.", credentials.Username);
            return Unauthorized(e.Message);
        }
    }

    /// <summary>
    /// Validates a user token passed via HTTP headers. 
    /// </summary>
    /// <param name="cancellationToken">A cancellation token.</param>
    /// <returns></returns>
    /// <response code="200">If validation succeeds.</response>
    /// <response code="401">If validation fails.</response>
    [HttpHead("validate")]
    [Authorize]
    public async Task<IActionResult> ValidateTokenAsync(CancellationToken cancellationToken)
    {
        return await Task.FromResult<ActionResult>(Ok());
    }
}
