using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.Application.Validation.Inputs;

/// <summary>Validates ApprovalRequestListQueryCommand before processing input.</summary>
public sealed class ApprovalRequestListQueryCommandValidator : AbstractValidator<ApprovalRequestListQueryCommand>
{
    public ApprovalRequestListQueryCommandValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.SortDirection).IsInEnum();
        RuleFor(value => value.SortBy).IsInEnum();
        RuleFor(value => value.Page).InclusiveBetween(PaginationLimits.MinimumPage, PaginationLimits.MaximumPage);
        RuleFor(value => value.PageSize).InclusiveBetween(PaginationLimits.MinimumPageSize, PaginationLimits.MaximumPageSize);
        RuleFor(value => value.Title).MaximumLength(FieldLimits.Name);
        RuleFor(value => value.RequestedBy).MaximumLength(FieldLimits.ParticipantDisplayName);
        RuleFor(value => value.Status).NotNull();
        RuleFor(value => value.Status)
            .Must(values => values is null || values.Count <= CollectionLimits.Items)
            .WithMessage($"At most {CollectionLimits.Items} items are allowed.");
        RuleForEach(value => value.Status).IsInEnum();
        RuleFor(value => value.CreatedTo)
            .Must((value, end) => !value.CreatedFrom.HasValue || !end.HasValue || end >= value.CreatedFrom)
            .WithMessage("End date must not precede start date.");
    }
}
