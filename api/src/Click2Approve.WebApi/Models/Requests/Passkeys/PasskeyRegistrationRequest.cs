using System.ComponentModel.DataAnnotations;
using Click2Approve.Domain.Validation;
using Fido2NetLib;

namespace Click2Approve.WebApi.Models.Requests.Passkeys;

/// <summary>
/// Contains a new passkey credential and its user-facing metadata.
/// </summary>
public class PasskeyRegistrationRequest
{
    public required AuthenticatorAttestationRawResponse Credential { get; init; }

    public string? AuthenticatorAttachment { get; init; }

    [Required]
    [StringLength(PasskeyLimits.Name)]
    public string Name { get; init; } = string.Empty;
}
