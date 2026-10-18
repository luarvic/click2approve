using System.ComponentModel.DataAnnotations;
using Click2Approve.Domain.Validation;
using Fido2NetLib;

namespace Click2Approve.WebApi.Models.Requests.Passkeys;

/// <summary>
/// Contains a new passkey credential and its user-facing metadata.
/// </summary>
public class PasskeyRegistrationRequest
{
    /// <summary>Passkey registration credential returned by the authenticator.</summary>
    public required AuthenticatorAttestationRawResponse Credential { get; init; }

    /// <summary>Authenticator attachment reported by the browser.</summary>
    public string? AuthenticatorAttachment { get; init; }

    /// <summary>User-facing name assigned to the passkey.</summary>
    [Required]
    [StringLength(PasskeyLimits.Name)]
    public string Name { get; init; } = string.Empty;
}
