using Click2Approve.Application.Models.Commands.ApprovalRequests;
using Click2Approve.Application.Validation.Inputs;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Tests;

/// <summary>Checks application validation independently from HTTP binding.</summary>
public class CommandValidationTests
{
    [Fact]
    public void TaskInputRejectsOversizedCommentsAndMalformedSignatures()
    {
        var result = new CompleteApprovalRequestTaskCommandValidator().Validate(new CompleteApprovalRequestTaskCommand
        {
            GlobalId = Guid.NewGuid(), Result = true, Comment = new string('x', 4001),
            AssigneeSignatureJson = "{\"points\":[]}"
        });
        Assert.Contains(result.Errors, error => error.PropertyName == "Comment");
        Assert.Contains(result.Errors, error => error.PropertyName == "AssigneeSignatureJson");
    }

    [Fact]
    public void NestedAssigneeIdentifiersCannotBeEmpty()
    {
        var result = new SubmitApprovalRequestCommandValidator().Validate(new SubmitApprovalRequestCommand
        {
            Title = "Review", Steps = [new ApprovalRequestStepCommand
            {
                Sequence = 1, Mode = ApprovalStepMode.All, Action = ApprovalRequestTaskAction.Approve,
                Assignees = [new ApprovalRequestAssigneeCommand { Type = AssigneeType.Employee, EmployeeGlobalId = Guid.Empty }]
            }]
        });
        Assert.Contains(result.Errors, error => error.PropertyName == "Steps[0].Assignees[0].EmployeeGlobalId");
    }
}
