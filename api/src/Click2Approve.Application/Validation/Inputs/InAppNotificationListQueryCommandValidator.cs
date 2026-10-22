using Click2Approve.Application.Models.Commands.Notifications;
using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.Application.Validation.Inputs;

/// <summary>Validates InAppNotificationListQueryCommand before processing input.</summary>
public sealed class InAppNotificationListQueryCommandValidator : AbstractValidator<InAppNotificationListQueryCommand>
{
    public InAppNotificationListQueryCommandValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.SortDirection).IsInEnum();
        RuleFor(value => value.Page).InclusiveBetween(PaginationLimits.MinimumPage, PaginationLimits.MaximumPage);
        RuleFor(value => value.PageSize).InclusiveBetween(PaginationLimits.MinimumPageSize, PaginationLimits.MaximumPageSize);
        RuleFor(value => value.Type).NotNull();
        RuleFor(value => value.Type)
            .Must(values => values is null || values.Count <= CollectionLimits.Items)
            .WithMessage($"At most {CollectionLimits.Items} items are allowed.");
        RuleForEach(value => value.Type).IsInEnum();
        RuleFor(value => value.Status).NotNull();
        RuleFor(value => value.Status)
            .Must(values => values is null || values.Count <= CollectionLimits.Items)
            .WithMessage($"At most {CollectionLimits.Items} items are allowed.");
        RuleFor(value => value.Details).MaximumLength(FieldLimits.Name);
        RuleFor(value => value.ReceivedTo)
            .Must((value, end) => !value.ReceivedFrom.HasValue || !end.HasValue || end >= value.ReceivedFrom)
            .WithMessage("End date must not precede start date.");
    }
}
