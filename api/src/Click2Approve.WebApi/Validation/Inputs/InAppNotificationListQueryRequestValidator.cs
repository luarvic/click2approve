using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.WebApi.Validation.Inputs;

/// <summary>Validates InAppNotificationListQueryRequest before processing input.</summary>
public sealed class InAppNotificationListQueryRequestValidator : AbstractValidator<InAppNotificationListQueryRequest>
{
    public InAppNotificationListQueryRequestValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.Page).InclusiveBetween(PaginationLimits.MinimumPage, PaginationLimits.MaximumPage);
        RuleFor(value => value.PageSize).InclusiveBetween(PaginationLimits.MinimumPageSize, PaginationLimits.MaximumPageSize);
        RuleFor(value => value.SortDirection)
            .MaximumLength(FieldLimits.Name)
            .Must(value => value is null || new[] { "asc", "desc" }.Contains(value.ToLowerInvariant()))
            .WithMessage("Sort direction must be asc or desc.");
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
