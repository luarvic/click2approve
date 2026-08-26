using Click2Approve.Domain.Models;
using FluentValidation;

namespace Click2Approve.Application.Validation.ApprovalRequests;

/// <summary>
/// Validates whether an approval request can be deleted.
/// </summary>
public class ApprovalRequestDeletionValidator : AbstractValidator<ApprovalRequest>
{
    public ApprovalRequestDeletionValidator()
    {
        RuleFor(request => request.NextRevisionApprovalRequest)
            .Null()
            .WithMessage("The approval request cannot be deleted because a later revision references it.");
    }
}
