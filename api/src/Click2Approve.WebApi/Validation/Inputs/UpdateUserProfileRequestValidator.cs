using Click2Approve.Application.Validation;
using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.WebApi.Validation.Inputs;

/// <summary>Validates UpdateUserProfileRequest before processing input.</summary>
public sealed class UpdateUserProfileRequestValidator : AbstractValidator<UpdateUserProfileRequest>
{
    public UpdateUserProfileRequestValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.FirstName).MaximumLength(FieldLimits.Name);
        RuleFor(value => value.LastName).MaximumLength(FieldLimits.Name);
        RuleFor(value => value.DefaultTenantGlobalId)
            .Must(value => value != Guid.Empty)
            .WithMessage("A non-empty identifier is required.");
        RuleFor(value => value.DefaultSignatureJson)
            .MaximumLength(FieldLimits.Signature)
            .Must(SignatureValidation.IsValid)
            .WithMessage("Enter a valid signature.");
        RuleFor(value => value.NotificationPreferences).NotNull();
        RuleFor(value => value.NotificationPreferences)
            .Must(values => values is null || values.Count <= CollectionLimits.Items)
            .WithMessage($"At most {CollectionLimits.Items} items are allowed.");
        RuleForEach(value => value.NotificationPreferences)
            .Cascade(CascadeMode.Continue)
            .NotNull()
            .SetValidator(new UserNotificationPreferenceRequestValidator());
        RuleFor(value => value.NotificationPreferences)
            .Must(values => values is null || values.Where(item => item is not null).Select(item => (item.Type, item.Channel)).Distinct().Count() == values.Count)
            .WithMessage("Notification preferences must be unique.");
    }
}
