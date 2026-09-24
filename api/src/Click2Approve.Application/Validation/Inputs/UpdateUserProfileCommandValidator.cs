using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.Application.Validation.Inputs;

/// <summary>Validates UpdateUserProfileCommand before processing input.</summary>
public sealed class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
{
    public UpdateUserProfileCommandValidator()
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
            .SetValidator(new UserNotificationPreferenceCommandValidator());
        RuleFor(value => value.NotificationPreferences)
            .Must(values => values is null || values.Where(item => item is not null).Select(item => (item.Type, item.Channel)).Distinct().Count() == values.Count)
            .WithMessage("Notification preferences must be unique.");
    }
}
