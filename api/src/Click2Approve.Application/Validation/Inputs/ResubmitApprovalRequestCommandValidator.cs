using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.Application.Validation.Inputs;

/// <summary>Validates ResubmitApprovalRequestCommand before processing input.</summary>
public sealed class ResubmitApprovalRequestCommandValidator : AbstractValidator<ResubmitApprovalRequestCommand>
{
    public ResubmitApprovalRequestCommandValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.RequestFiles).NotNull();
        RuleFor(value => value.RequestFiles)
            .Must(values => values is null || values.Count <= CollectionLimits.Files)
            .WithMessage($"At most {CollectionLimits.Files} items are allowed.");
        RuleForEach(value => value.RequestFiles)
            .Cascade(CascadeMode.Continue)
            .NotNull()
            .SetValidator(new ApprovalRequestFileCommandValidator());
        RuleFor(value => value.Steps).NotNull();
        RuleFor(value => value.Steps)
            .Must(values => values is null || values.Count <= CollectionLimits.WorkflowSteps)
            .WithMessage($"At most {CollectionLimits.WorkflowSteps} items are allowed.");
        RuleFor(value => value.Steps).NotEmpty();
        RuleForEach(value => value.Steps)
            .Cascade(CascadeMode.Continue)
            .NotNull()
            .SetValidator(new ApprovalRequestStepCommandValidator());
        RuleFor(value => value.Description).MaximumLength(FieldLimits.Text);
        RuleFor(value => value.Steps)
            .Must(steps => steps is null || steps.Where(step => step is not null).Select(step => step.Sequence).Distinct().Count() == steps.Count)
            .WithMessage("Step sequences must be unique.");
    }
}
