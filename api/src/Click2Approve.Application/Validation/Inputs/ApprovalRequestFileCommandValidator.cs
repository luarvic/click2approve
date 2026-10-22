using FluentValidation;

namespace Click2Approve.Application.Validation.Inputs;

/// <summary>Validates ApprovalRequestFileCommand before processing input.</summary>
public sealed class ApprovalRequestFileCommandValidator : AbstractValidator<ApprovalRequestFileCommand>
{
    public ApprovalRequestFileCommandValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.UserFileGlobalId).NotEmpty();
        RuleFor(value => value.Sequence).GreaterThanOrEqualTo(0);
        RuleFor(value => value.RevisionAction).IsInEnum();
        RuleFor(value => value.PreviousApprovalRequestFileGlobalId)
            .Must(value => value != Guid.Empty)
            .WithMessage("A non-empty identifier is required.");
    }
}
