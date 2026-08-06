using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Abstractions.Services.ApprovalRequests;

/// <summary>
/// Adds edition-specific attribution details when an approval request reaches its final state.
/// </summary>
public interface IApprovalRequestCompletionAttributor
{
    /// <summary>
    /// Attributes a final request action to the user who performed it.
    /// </summary>
    Task AttributeAsync(AppUser user, ApprovalRequest approvalRequest, CancellationToken cancellationToken);
}
