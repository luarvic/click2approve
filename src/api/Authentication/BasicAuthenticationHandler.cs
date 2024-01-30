using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Encodings.Web;
using api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

namespace api.Authentication;

public class BasicAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly ILogger<BasicAuthenticationHandler> _logger;
    private readonly ITokenService _tokenService;
    private readonly IAccountService _accountService;

    public BasicAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ITokenService tokenService,
        IAccountService accountService)
        : base(options, logger, encoder)
    {
        _logger = logger.CreateLogger<BasicAuthenticationHandler>();
        _tokenService = tokenService;
        _accountService = accountService;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out StringValues authorizationHeader))
        {
            return await Task.FromResult(AuthenticateResult.Fail("Missing authorization header."));
        }
        if (string.IsNullOrWhiteSpace(authorizationHeader))
        {
            return await Task.FromResult(AuthenticateResult.Fail("Empty authorization header."));
        }
        if (!AuthenticationHeaderValue.TryParse(authorizationHeader, out AuthenticationHeaderValue? value))
        {
            return await Task.FromResult(AuthenticateResult.Fail("Empty authorization header value."));
        }
        if (value.Parameter == null)
        {
            return await Task.FromResult(AuthenticateResult.Fail("Empty authorization header value parameter."));
        }
        try
        {
            var (username, password) = _tokenService.GetCredentialsFromToken(value.Parameter);
            await _accountService.AuthenticateUserAsync(username, password, CancellationToken.None);
            var claims = new[] { new Claim("name", username) };
            var identity = new ClaimsIdentity(claims, "Basic");
            var claimsPrincipal = new ClaimsPrincipal(identity);
            return await Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(claimsPrincipal, Scheme.Name)));
        }
        catch (Exception e)
        {
            const string errorMessage = "Incorrect authorization token.";
            _logger.LogWarning(e, errorMessage);
            return await Task.FromResult(AuthenticateResult.Fail(errorMessage));
        }
    }
}
