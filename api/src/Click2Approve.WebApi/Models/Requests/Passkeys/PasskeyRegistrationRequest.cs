using System.ComponentModel.DataAnnotations;
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
    [StringLength(100)]
    public string Name { get; init; } = string.Empty;
}
