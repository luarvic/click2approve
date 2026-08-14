using Click2Approve.Application.Extensions;
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
        approvalRequest.CompletedByDisplayName = user.FormatParticipantDisplayName();
        return Task.CompletedTask;
    }
}
