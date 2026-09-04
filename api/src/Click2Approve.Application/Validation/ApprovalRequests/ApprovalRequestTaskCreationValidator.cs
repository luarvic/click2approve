using Click2Approve.Application.Models.ApprovalRequests;
using FluentValidation;

namespace Click2Approve.Application.Validation.ApprovalRequests;

/// <summary>Validates newly created workflow task batches.</summary>
public class ApprovalRequestTaskCreationValidator : AbstractValidator<ApprovalRequestTaskCreationContext>
{
    public ApprovalRequestTaskCreationValidator()
    {
        RuleFor(validation => validation.Tasks).NotEmpty();
    }
}
