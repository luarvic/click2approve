using Click2Approve.Domain.Models;
using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.Application.Validation.Inputs;

/// <summary>Validates ApprovalRequestAssigneeCommand before processing input.</summary>
public sealed class ApprovalRequestAssigneeCommandValidator : AbstractValidator<ApprovalRequestAssigneeCommand>
{
    public ApprovalRequestAssigneeCommandValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;
        RuleFor(value => value.Type).IsInEnum();
        RuleFor(value => value.Email).MaximumLength(FieldLimits.Email).EmailAddress();
        RuleFor(value => value.UserGlobalId)
            .Must(value => value != Guid.Empty)
            .WithMessage("A non-empty identifier is required.");
        RuleFor(value => value.EmployeeGlobalId)
            .Must(value => value != Guid.Empty)
            .WithMessage("A non-empty identifier is required.");
        RuleFor(value => value.TeamGlobalId)
            .Must(value => value != Guid.Empty)
            .WithMessage("A non-empty identifier is required.");
        RuleFor(value => value.Email)
            .NotEmpty()
            .When(value => value.Type == AssigneeType.User);
        RuleFor(value => value.EmployeeGlobalId).NotNull().When(value => value.Type == AssigneeType.Employee);
        RuleFor(value => value.TeamGlobalId).NotNull().When(value => value.Type == AssigneeType.Team);
    }
}
