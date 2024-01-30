using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

// A controller that implements API endpoints for managing user access (sing up, sign in, etc.).
[ApiController]
[Route("account")]
public class AccountController(IAccountService accountService, ITokenService tokenService) : ControllerBase
{
    private readonly IAccountService _accountService = accountService;
    private readonly ITokenService _tokenService = tokenService;

    [HttpPost("register")]
    public async Task<ActionResult<string>> RegisterAsync(string username, string password, CancellationToken cancellationToken)
    {
        try
        {
            await _accountService.RegisterUserAsync(username, password, cancellationToken);
            var token = _tokenService.GetTokenFromCredentials(username, password);
            return Ok(token);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("authenticate")]
    public async Task<ActionResult<string>> AuthenticateAsync(string username, string password, CancellationToken cancellationToken)
    {
        try
        {
            await _accountService.AuthenticateUserAsync(username, password, cancellationToken);
            var token = _tokenService.GetTokenFromCredentials(username, password);
            return Ok(token);
        }
        catch (Exception e)
        {
            return Unauthorized(e.Message);
        }
    }
}
