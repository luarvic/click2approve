using Click2Approve.Domain.Models;
using FluentValidation;

namespace Click2Approve.Application.Validation.ApprovalRequests;

/// <summary>Enforces workflow requirements before mutating a task.</summary>
public sealed class TaskCompletionValidator : AbstractValidator<TaskCompletionContext>
{
    public TaskCompletionValidator(IApprovalRequestTaskRepository repository)
    {
        RuleFor(context => context.Task.Status).Equal(ApprovalRequestTaskStatus.Pending)
            .OverridePropertyName("Result").WithMessage("The task has already been completed.");
        RuleFor(context => context.Command.Comment).NotEmpty()
            .When(context => !context.Command.Result || context.Task.IsCommentRequired)
            .OverridePropertyName("Comment").WithMessage("Comment is required.");
        RuleFor(context => context.Command.AssigneeLegalName).NotEmpty()
            .When(context => context.Command.Result && context.Task.IsElectronicSignatureRequired)
            .OverridePropertyName("AssigneeLegalName").WithMessage("Legal name is required.");
        RuleFor(context => context.Command.AssigneeSignatureJson).NotEmpty()
            .When(context => context.Command.Result && context.Task.IsElectronicSignatureRequired)
            .OverridePropertyName("AssigneeSignatureJson").WithMessage("Signature is required.");
        RuleFor(context => context.Task)
            .MustAsync((task, cancellationToken) => repository.HasAttachmentsAsync(task, cancellationToken))
            .When(context => context.Command.Result && context.Task.IsAttachmentRequired)
            .OverridePropertyName("UserFileGlobalIds").WithMessage("At least one attachment is required.");
    }
}
