using api.Models.DTOs;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

// A controller that implements API endpoints for managing user access (sing up, sign in, etc.).
[ApiController]
[Route("account")]
public class AccountController(IAccountService accountService, ITokenService tokenService) : ControllerBase
{
    private readonly IAccountService _accountService = accountService;
    private readonly ITokenService _tokenService = tokenService;

    [AllowAnonymous]
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
            return BadRequest(e.Message);
        }
    }

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
            return Unauthorized(e.Message);
        }
    }
}
