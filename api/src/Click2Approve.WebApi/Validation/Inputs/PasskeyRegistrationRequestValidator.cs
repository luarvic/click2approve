using Click2Approve.Domain.Validation;
using Click2Approve.WebApi.Models.Requests.Passkeys;
using FluentValidation;

namespace Click2Approve.WebApi.Validation.Inputs;

/// <summary>Validates PasskeyRegistrationRequest before processing input.</summary>
public sealed class PasskeyRegistrationRequestValidator : AbstractValidator<PasskeyRegistrationRequest>
{
    public PasskeyRegistrationRequestValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.Credential).NotNull().SetValidator(new AuthenticatorAttestationValidator());
        RuleFor(value => value.AuthenticatorAttachment).MaximumLength(FieldLimits.Name);
        RuleFor(value => value.Name).NotEmpty().MaximumLength(PasskeyLimits.Name);
    }
}
