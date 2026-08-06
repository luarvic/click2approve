using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.ApprovalRequests;

/// <summary>
/// Provides task-completion attribution.
/// </summary>
public class ApprovalRequestTaskCompletionAttributor : IApprovalRequestTaskCompletionAttributor
{
    /// <summary>
    /// Applies task-completion attribution.
    /// </summary>
    public Task AttributeAsync(AppUser user, ApprovalRequestTask approvalRequestTask, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
