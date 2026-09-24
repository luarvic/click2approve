using Click2Approve.Domain.Validation;
using Fido2NetLib;
using FluentValidation;

namespace Click2Approve.WebApi.Validation.Inputs;

/// <summary>Checks credential identifiers fit Identity storage before registering a passkey.</summary>
public sealed class AuthenticatorAttestationValidator : AbstractValidator<AuthenticatorAttestationRawResponse>
{
    public AuthenticatorAttestationValidator()
    {
        RuleFor(response => response.Id).NotEmpty().MaximumLength(PasskeyLimits.EncodedCredentialId);
        RuleFor(response => response.RawId).NotEmpty().Must(id => id is null || id.Length <= PasskeyLimits.CredentialIdBytes);
        RuleFor(response => response.Response).NotNull();
    }
}
