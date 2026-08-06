using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.ApprovalRequests;

/// <summary>
/// Adds edition-specific attribution details when an approval request task is completed.
/// </summary>
public interface IApprovalRequestTaskCompletionAttributor
{
    /// <summary>
    /// Attributes a completed task to the user who performed the action.
    /// </summary>
    Task AttributeAsync(AppUser user, ApprovalRequestTask approvalRequestTask, CancellationToken cancellationToken);
}
