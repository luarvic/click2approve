using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.WebApi.Validation.Inputs;

/// <summary>Validates ReadInAppNotificationsRequest before processing input.</summary>
public sealed class ReadInAppNotificationsRequestValidator : AbstractValidator<ReadInAppNotificationsRequest>
{
    public ReadInAppNotificationsRequestValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.NotificationGlobalIds).NotNull();
        RuleFor(value => value.NotificationGlobalIds)
            .Must(values => values is null || values.Count <= CollectionLimits.Items)
            .WithMessage($"At most {CollectionLimits.Items} items are allowed.");
        RuleFor(value => value.NotificationGlobalIds).NotEmpty();
        RuleForEach(value => value.NotificationGlobalIds).NotEmpty();
        RuleFor(value => value.NotificationGlobalIds)
            .Must(values => values is null || values.Distinct().Count() == values.Count)
            .WithMessage("Duplicate identifiers are not allowed.");
    }
}
