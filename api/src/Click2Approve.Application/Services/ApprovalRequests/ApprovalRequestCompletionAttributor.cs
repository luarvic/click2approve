using Click2Approve.Application.Abstractions.Services.ApprovalRequests;
using Click2Approve.Application.Helpers;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Records the user who completed an approval request.
/// </summary>
public class ApprovalRequestCompletionAttributor : IApprovalRequestCompletionAttributor
{
    /// <summary>
/// Records completion attribution.
    /// </summary>
    public Task AttributeAsync(AppUser user, ApprovalRequest approvalRequest, CancellationToken cancellationToken)
    {
        approvalRequest.CompletedByUser = user;
        approvalRequest.CompletedByUserId = user.Id;
        approvalRequest.CompletedByDisplayName = DisplayNameHelpers.FormatParticipantName(user.FirstName, user.LastName);
        return Task.CompletedTask;
    }
}
