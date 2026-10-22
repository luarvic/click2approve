using Click2Approve.Domain.Validation;
using Fido2NetLib;
using FluentValidation;

namespace Click2Approve.WebApi.Validation.Inputs;

/// <summary>Checks WebAuthn input shape before cryptographic verification.</summary>
public sealed class AuthenticatorAssertionValidator : AbstractValidator<AuthenticatorAssertionRawResponse>
{
    public AuthenticatorAssertionValidator()
    {
        RuleFor(response => response.Id).NotEmpty().MaximumLength(PasskeyLimits.EncodedCredentialId);
        RuleFor(response => response.RawId).NotEmpty().Must(id => id is null || id.Length <= PasskeyLimits.CredentialIdBytes);
        RuleFor(response => response.Response).NotNull();
    }
}
