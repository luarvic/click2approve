using System.Text;
using System.Text.Json;
using Asp.Versioning;
using Click2Approve.Domain.Models;
using Click2Approve.WebApi.Extensions;
using Click2Approve.WebApi.Identity.Passkeys;
using Click2Approve.WebApi.Models.Requests.Passkeys;
using Click2Approve.WebApi.Models.Responses.Passkeys;
using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;

namespace Click2Approve.WebApi.Controllers;

/// <summary>
/// API endpoints that register, authenticate with, and remove passkeys.
/// </summary>
[Tags("Click2Approve.WebApi.Passkeys")]
[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/account/passkeys")]
public class PasskeyController(
    IFido2 fido2,
    IDataProtectionProvider dataProtectionProvider,
    SignInManager<AppUser> signInManager,
    UserManager<AppUser> userManager) : ControllerBase
{
    private const string LoginProvider = "Click2Approve.Passkeys";
    private const string StateCookieName = "Click2Approve.PasskeyState";
    private static readonly TimeSpan StateLifetime = TimeSpan.FromMinutes(5);
    private readonly IDataProtector _stateProtector = dataProtectionProvider.CreateProtector("Click2Approve.Passkeys.State.v1");
    private readonly IFido2 _fido2 = fido2;
    private readonly SignInManager<AppUser> _signInManager = signInManager;
    private readonly UserManager<AppUser> _userManager = userManager;

    /// <summary>
    /// Lists the passkeys registered by the authenticated user.
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<PasskeyResponse>>> ListAsync()
    {
        var user = await _userManager.GetAppUserAsync(User);
        var credentialIds = (await _userManager.GetLoginsAsync(user))
            .Where(login => login.LoginProvider == LoginProvider)
            .ToArray();
        var passkeys = await Task.WhenAll(credentialIds.Select(async login =>
            ToPasskeyResponse(login.ProviderKey, await GetStoredPasskeyAsync(user, login.ProviderKey))));
        return Ok(passkeys);
    }

    /// <summary>
    /// Creates WebAuthn registration options for the authenticated user.
    /// </summary>
    [HttpPost("registration/options")]
    [Authorize]
    public async Task<ActionResult<CredentialCreateOptions>> CreateRegistrationOptionsAsync()
    {
        var user = await _userManager.GetAppUserAsync(User);
        var passkeys = await GetStoredPasskeysAsync(user);
        var options = _fido2.RequestNewCredential(new RequestNewCredentialParams
        {
            User = new Fido2User
            {
                DisplayName = user.Email ?? user.UserName ?? "Click2Approve user",
                Id = Encoding.UTF8.GetBytes(user.Id.ToString()),
                Name = user.UserName ?? user.Email ?? user.Id.ToString()
            },
            ExcludeCredentials = passkeys.Select(passkey => new PublicKeyCredentialDescriptor(passkey.CredentialIdBytes)).ToArray(),
            AuthenticatorSelection = new AuthenticatorSelection
            {
                ResidentKey = ResidentKeyRequirement.Required,
                UserVerification = UserVerificationRequirement.Required
            },
            AttestationPreference = AttestationConveyancePreference.None
        });
        WriteState(new PasskeyCeremonyState { OptionsJson = options.ToJson(), UserId = user.Id.ToString() });
        return Ok(options);
    }

    /// <summary>
    /// Verifies and stores a newly registered passkey.
    /// </summary>
    [HttpPost("registration")]
    [Authorize]
    public async Task<ActionResult<PasskeyResponse>> CompleteRegistrationAsync(
        [FromBody] PasskeyRegistrationRequest request,
        CancellationToken cancellationToken)
    {
        var state = ReadState();
        var user = await _userManager.GetAppUserAsync(User);
        if (state.UserId != user.Id.ToString())
        {
            return Unauthorized();
        }

        var credential = await _fido2.MakeNewCredentialAsync(new MakeNewCredentialParams
        {
            AttestationResponse = request.Credential,
            OriginalOptions = CredentialCreateOptions.FromJson(state.OptionsJson),
            IsCredentialIdUniqueToUserCallback = async (parameters, _) =>
                await _userManager.FindByLoginAsync(LoginProvider, WebEncoders.Base64UrlEncode(parameters.CredentialId)) is null
        }, cancellationToken);
        var credentialId = WebEncoders.Base64UrlEncode(credential.Id);
        var addLoginResult = await _userManager.AddLoginAsync(user, new UserLoginInfo(LoginProvider, credentialId, LoginProvider));
        if (!addLoginResult.Succeeded)
        {
            return BadRequest(new ValidationProblemDetails(addLoginResult.Errors.ToDictionary(error => error.Code, error => new[] { error.Description })));
        }

        var storedPasskey = new StoredPasskeyCredential
        {
            AuthenticatorAttachment = request.AuthenticatorAttachment,
            CredentialId = credentialId,
            CreatedAt = DateTimeOffset.UtcNow,
            Name = request.Name.Trim(),
            PublicKey = Convert.ToBase64String(credential.PublicKey),
            SignCount = credential.SignCount
        };
        var tokenResult = await _userManager.SetAuthenticationTokenAsync(
            user,
            LoginProvider,
            credentialId,
            JsonSerializer.Serialize(storedPasskey));
        if (!tokenResult.Succeeded)
        {
            await _userManager.RemoveLoginAsync(user, LoginProvider, credentialId);
            return BadRequest(new ValidationProblemDetails(tokenResult.Errors.ToDictionary(error => error.Code, error => new[] { error.Description })));
        }

        return Ok(ToPasskeyResponse(credentialId, storedPasskey));
    }

    /// <summary>
    /// Creates WebAuthn authentication options for a discoverable passkey.
    /// </summary>
    [HttpPost("authentication/options")]
    [AllowAnonymous]
    public ActionResult<AssertionOptions> CreateAuthenticationOptions()
    {
        var options = _fido2.GetAssertionOptions(new GetAssertionOptionsParams
        {
            UserVerification = UserVerificationRequirement.Required
        });
        WriteState(new PasskeyCeremonyState { OptionsJson = options.ToJson() });
        return Ok(options);
    }

    /// <summary>
    /// Verifies a passkey assertion and issues the standard bearer and refresh tokens.
    /// </summary>
    [HttpPost("authentication")]
    [AllowAnonymous]
    public async Task<IResult> CompleteAuthenticationAsync(
        [FromBody] AuthenticatorAssertionRawResponse response,
        CancellationToken cancellationToken)
    {
        var state = ReadState();
        var credentialId = WebEncoders.Base64UrlEncode(response.RawId);
        var user = await _userManager.FindByLoginAsync(LoginProvider, credentialId);
        if (user is null)
        {
            return TypedResults.Unauthorized();
        }

        var storedPasskey = await GetStoredPasskeyAsync(user, credentialId);
        if (storedPasskey is null)
        {
            return TypedResults.Unauthorized();
        }

        var result = await _fido2.MakeAssertionAsync(new MakeAssertionParams
        {
            AssertionResponse = response,
            OriginalOptions = AssertionOptions.FromJson(state.OptionsJson),
            StoredPublicKey = Convert.FromBase64String(storedPasskey.PublicKey),
            StoredSignatureCounter = storedPasskey.SignCount,
            IsUserHandleOwnerOfCredentialIdCallback = (parameters, _) => Task.FromResult(
                parameters.CredentialId.SequenceEqual(response.RawId) &&
                parameters.UserHandle.SequenceEqual(Encoding.UTF8.GetBytes(user.Id.ToString())))
        }, cancellationToken);
        storedPasskey.SignCount = result.SignCount;
        storedPasskey.LastUsedAt = DateTimeOffset.UtcNow;
        var tokenResult = await _userManager.SetAuthenticationTokenAsync(
            user,
            LoginProvider,
            credentialId,
            JsonSerializer.Serialize(storedPasskey));
        if (!tokenResult.Succeeded)
        {
            return TypedResults.Problem("Unable to update the passkey.", statusCode: StatusCodes.Status500InternalServerError);
        }

        var principal = await _signInManager.CreateUserPrincipalAsync(user);
        return TypedResults.SignIn(principal, authenticationScheme: IdentityConstants.BearerScheme);
    }

    /// <summary>
    /// Removes a passkey registered by the authenticated user.
    /// </summary>
    [HttpDelete("{credentialId}")]
    [Authorize]
    public async Task<IActionResult> DeleteAsync(string credentialId)
    {
        var user = await _userManager.GetAppUserAsync(User);
        var result = await _userManager.RemoveLoginAsync(user, LoginProvider, credentialId);
        if (!result.Succeeded)
        {
            return BadRequest(new ValidationProblemDetails(result.Errors.ToDictionary(error => error.Code, error => new[] { error.Description })));
        }

        await _userManager.RemoveAuthenticationTokenAsync(user, LoginProvider, credentialId);
        return NoContent();
    }

    private async Task<IReadOnlyList<(string CredentialId, byte[] CredentialIdBytes)>> GetStoredPasskeysAsync(AppUser user)
    {
        var logins = await _userManager.GetLoginsAsync(user);
        return logins
            .Where(login => login.LoginProvider == LoginProvider)
            .Select(login => (login.ProviderKey, WebEncoders.Base64UrlDecode(login.ProviderKey)))
            .ToArray();
    }

    private async Task<StoredPasskeyCredential?> GetStoredPasskeyAsync(AppUser user, string credentialId)
    {
        var value = await _userManager.GetAuthenticationTokenAsync(user, LoginProvider, credentialId);
        return value is null ? null : JsonSerializer.Deserialize<StoredPasskeyCredential>(value);
    }

    private static PasskeyResponse ToPasskeyResponse(string credentialId, StoredPasskeyCredential? storedPasskey)
    {
        var authenticatorType = storedPasskey?.AuthenticatorAttachment switch
        {
            "cross-platform" => "Security key",
            "platform" => "Platform authenticator",
            _ => "Passkey"
        };
        return new PasskeyResponse
        {
            CreatedAt = storedPasskey?.CreatedAt?.ToString("O"),
            CredentialId = credentialId,
            LastUsedAt = storedPasskey?.LastUsedAt?.ToString("O"),
            Name = storedPasskey?.Name ?? authenticatorType,
            Type = authenticatorType
        };
    }

    private PasskeyCeremonyState ReadState()
    {
        var protectedState = Request.Cookies[StateCookieName] ?? throw new UnauthorizedAccessException("Passkey session has expired.");
        Response.Cookies.Delete(StateCookieName);
        return JsonSerializer.Deserialize<PasskeyCeremonyState>(_stateProtector.Unprotect(protectedState))
            ?? throw new UnauthorizedAccessException("Passkey session is invalid.");
    }

    private void WriteState(PasskeyCeremonyState state)
    {
        Response.Cookies.Append(StateCookieName, _stateProtector.Protect(JsonSerializer.Serialize(state)), new CookieOptions
        {
            HttpOnly = true,
            IsEssential = true,
            MaxAge = StateLifetime,
            SameSite = SameSiteMode.Strict,
            Secure = Request.IsHttps
        });
    }
}
