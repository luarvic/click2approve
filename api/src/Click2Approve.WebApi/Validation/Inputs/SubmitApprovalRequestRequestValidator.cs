using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.WebApi.Validation.Inputs;

/// <summary>Validates SubmitApprovalRequestRequest before processing input.</summary>
public sealed class SubmitApprovalRequestRequestValidator : AbstractValidator<SubmitApprovalRequestRequest>
{
    public SubmitApprovalRequestRequestValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.Title).NotEmpty().MaximumLength(FieldLimits.Name);
        RuleFor(value => value.PreviousRevisionApprovalRequestGlobalId)
            .Must(value => value != Guid.Empty)
            .WithMessage("A non-empty identifier is required.");
        RuleFor(value => value.RequestFiles).NotNull();
        RuleFor(value => value.RequestFiles)
            .Must(values => values is null || values.Count <= CollectionLimits.Files)
            .WithMessage($"At most {CollectionLimits.Files} items are allowed.");
        RuleForEach(value => value.RequestFiles)
            .Cascade(CascadeMode.Continue)
            .NotNull()
            .SetValidator(new ApprovalRequestFileRequestValidator());
        RuleFor(value => value.Steps).NotNull();
        RuleFor(value => value.Steps)
            .Must(values => values is null || values.Count <= CollectionLimits.WorkflowSteps)
            .WithMessage($"At most {CollectionLimits.WorkflowSteps} items are allowed.");
        RuleFor(value => value.Steps).NotEmpty();
        RuleForEach(value => value.Steps)
            .Cascade(CascadeMode.Continue)
            .NotNull()
            .SetValidator(new ApprovalRequestStepRequestValidator());
        RuleFor(value => value.Description).MaximumLength(FieldLimits.Text);
        RuleFor(value => value.Steps)
            .Must(steps => steps is null || steps.Where(step => step is not null).Select(step => step.Sequence).Distinct().Count() == steps.Count)
            .WithMessage("Step sequences must be unique.");
    }
}
