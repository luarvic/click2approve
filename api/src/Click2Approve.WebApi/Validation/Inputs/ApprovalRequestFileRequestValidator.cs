using FluentValidation;

namespace Click2Approve.WebApi.Validation.Inputs;

/// <summary>Validates ApprovalRequestFileRequest before processing input.</summary>
public sealed class ApprovalRequestFileRequestValidator : AbstractValidator<ApprovalRequestFileRequest>
{
    public ApprovalRequestFileRequestValidator()
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
