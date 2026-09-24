using FluentValidation;

namespace Click2Approve.Application.Validation.Inputs;

/// <summary>Validates UserNotificationPreferenceCommand before processing input.</summary>
public sealed class UserNotificationPreferenceCommandValidator : AbstractValidator<UserNotificationPreferenceCommand>
{
    public UserNotificationPreferenceCommandValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.Type).IsInEnum();
        RuleFor(value => value.Channel).IsInEnum();
    }
}
