using FluentValidation;

namespace Click2Approve.WebApi.Validation.Inputs;

/// <summary>Validates UserNotificationPreferenceRequest before processing input.</summary>
public sealed class UserNotificationPreferenceRequestValidator : AbstractValidator<UserNotificationPreferenceRequest>
{
    public UserNotificationPreferenceRequestValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.Type).IsInEnum();
        RuleFor(value => value.Channel).IsInEnum();
    }
}
