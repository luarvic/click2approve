using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.WebApi.Validation.Inputs;

/// <summary>Validates ApprovalRequestStepRequest before processing input.</summary>
public sealed class ApprovalRequestStepRequestValidator : AbstractValidator<ApprovalRequestStepRequest>
{
    public ApprovalRequestStepRequestValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.Sequence).GreaterThanOrEqualTo(0);
        RuleFor(value => value.Mode).IsInEnum();
        RuleFor(value => value.Action).IsInEnum();
        RuleFor(value => value.Instructions).MaximumLength(FieldLimits.Text);
        RuleFor(value => value.VisibilityMode).IsInEnum();
        RuleFor(value => value.Assignees).NotNull();
        RuleFor(value => value.Assignees)
            .Must(values => values is null || values.Count <= CollectionLimits.StepAssignees)
            .WithMessage($"At most {CollectionLimits.StepAssignees} items are allowed.");
        RuleFor(value => value.Assignees).NotEmpty();
        RuleForEach(value => value.Assignees)
            .Cascade(CascadeMode.Continue)
            .NotNull()
            .SetValidator(new ApprovalRequestAssigneeRequestValidator());
    }
}
