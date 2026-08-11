using Click2Approve.Application.Helpers;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Records the user who completed an approval request task.
/// </summary>
public class ApprovalRequestTaskCompletionAttributor : IApprovalRequestTaskCompletionAttributor
{
    /// <summary>
/// Records completion attribution.
    /// </summary>
    public Task AttributeAsync(AppUser user, ApprovalRequestTask approvalRequestTask, CancellationToken cancellationToken)
    {
        approvalRequestTask.CompletedByUser = user;
        approvalRequestTask.CompletedByUserId = user.Id;
        approvalRequestTask.CompletedByDisplayName = DisplayNameHelpers.FormatParticipantName(user.FirstName, user.LastName, user.NormalizedEmail);
        return Task.CompletedTask;
    }
}
