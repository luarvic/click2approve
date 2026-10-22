using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.Application.Validation.Inputs;

/// <summary>Validates CompleteApprovalRequestTaskCommand before processing input.</summary>
public sealed class CompleteApprovalRequestTaskCommandValidator : AbstractValidator<CompleteApprovalRequestTaskCommand>
{
    public CompleteApprovalRequestTaskCommandValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.GlobalId).NotEmpty();
        RuleFor(value => value.Comment).MaximumLength(FieldLimits.Text);
        RuleFor(value => value.AssigneeLegalName).MaximumLength(FieldLimits.Name);
        RuleFor(value => value.AssigneeRepresentationDetails).MaximumLength(FieldLimits.Details);
        RuleFor(value => value.AssigneeSignatureJson)
            .MaximumLength(FieldLimits.Signature)
            .Must(SignatureValidation.IsValid)
            .WithMessage("Enter a valid signature.");
        RuleFor(value => value.AssigneeIpAddress).MaximumLength(FieldLimits.IpAddress);
        RuleFor(value => value.AssigneeBrowserData).MaximumLength(FieldLimits.Details);
        RuleFor(value => value.ClientAuditContext).SetValidator(new ApprovalRequestTaskClientAuditContextValidator()!);
    }
}
